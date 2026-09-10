import type { DialogRoot } from '$lib/components/dialog/dialog.svelte'
import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { clamp } from '$lib/internal/clamp'
import { contains, getTarget } from '$lib/internal/dom'
import { getElementAtPoint } from '$lib/internal/get-element-at-point'
import { REASONS } from '$lib/internal/reasons'
import { findScrollableTouchTarget, type ScrollAxis } from '$lib/internal/scrollable'
import {
  getDisplacement,
  SwipeDismiss,
  type SwipeDirection
} from '$lib/internal/swipe-dismiss.svelte'
import { isElement } from '@floating-ui/utils/dom'
import { flushSync, untrack } from 'svelte'
import { on } from 'svelte/events'
import { DRAWER_SWIPE_MOVEMENT_X_VAR, DRAWER_SWIPE_MOVEMENT_Y_VAR } from './constants'
import type { DrawerProviderContext } from './context'
import type { DrawerRoot, DrawerSnapPoint } from './drawer.svelte'
import { DrawerSnapPoints, findClosestSnapPoint } from './snap-points.svelte'
import {
  canSwipeFromScrollEdgeOnMove,
  getBaseSwipeThreshold,
  hasScrollableContentOnAxis,
  isAtSwipeStartEdge,
  isDrawerContentTarget,
  isSwipeIgnoredTarget,
  MIN_SWIPE_THRESHOLD,
  resetBackdropSwipeVars,
  selectionEndpointElements,
  setBackdropSwipeVars,
  setBackdropSwipingAttribute,
  shouldIgnoreSwipeForTextSelection,
  shouldYieldTouchMove,
  updateTouchScrollPosition,
  type TouchScroll
} from './swipe-dom'

const FAST_SWIPE_VELOCITY = 0.5
const SNAP_VELOCITY_THRESHOLD = 0.5
// Velocities are px/ms, so multiplying by a duration in ms projects how far the drag would coast.
const SNAP_VELOCITY_MULTIPLIER = 300
const MAX_SNAP_VELOCITY = 4
const MIN_SWIPE_RELEASE_VELOCITY = 0.2
const MAX_SWIPE_RELEASE_VELOCITY = 4
const MIN_SWIPE_RELEASE_DURATION_MS = 80
const MAX_SWIPE_RELEASE_DURATION_MS = 360
const MIN_SWIPE_RELEASE_SCALAR = 0.1
const MAX_SWIPE_RELEASE_SCALAR = 1

function isRangeInput(
  target: EventTarget | null,
  win: Window & typeof globalThis
): target is HTMLInputElement {
  return target instanceof win.HTMLInputElement && target.type === 'range'
}

function isEventOnRangeInput(event: TouchEvent): boolean {
  const win = (event.target as Element | null)?.ownerDocument?.defaultView ?? window
  return event.composedPath().some((target) => isRangeInput(target, win))
}

type ReleaseDetails = {
  deltaX: number
  deltaY: number
  direction?: SwipeDirection
  velocityX: number
  velocityY: number
  releaseVelocityX: number
  releaseVelocityY: number
}

/** Swipe-to-dismiss and snap-point dragging for `DrawerViewport`. */
export class DrawerSwipe {
  #dialog: DialogRoot
  #drawer: DrawerRoot
  #provider: DrawerProviderContext | undefined

  #releaseStrength = $state<number | null>(null)
  #releasing = $state(false)
  #pendingCloseSnapPoint: DrawerSnapPoint | null | undefined = undefined

  #ignoreTouchSwipe = false
  #touchScroll: TouchScroll | null = null
  #lastPointerType: PointerEvent['pointerType'] | '' = ''
  #ignoreNextTouchStartFromPen = false
  #nestedSwipeActive = false

  #controlledDismissFrame = new AnimationFrame()

  #snapPointsState: DrawerSnapPoints
  #swipe: SwipeDismiss

  #nestedDrawerOpen = $derived.by(() => this.#dialog.nestedOpenDrawerCount > 0)

  #hasSnapPoints = $derived.by(() => !!this.#drawer.snapPoints?.length)

  #scrollAxis = $derived.by<ScrollAxis>(() => {
    const direction = this.#drawer.swipeDirection
    return direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical'
  })
  #isVerticalScrollAxis = $derived(this.#scrollAxis === 'vertical')

  #snapPointRange = $derived.by(() => {
    const snapPoints = this.#drawer.snapPoints
    if (!snapPoints || snapPoints.length < 2) return null
    const swipeDirection = this.#drawer.swipeDirection
    if (swipeDirection !== 'down' && swipeDirection !== 'up') return null
    const resolvedSnapPoints = this.#snapPointsState.resolvedSnapPoints
    if (resolvedSnapPoints.length < 2) return null
    const offsets = resolvedSnapPoints.map((point) => point.offset).sort((a, b) => a - b)
    const minOffset = offsets[0]
    return { minOffset, range: offsets[1] - minOffset }
  })

  #snapPointProgress = $derived.by(() => {
    const snapPointRange = this.#snapPointRange
    const offset = this.activeSnapPointOffset
    if (!snapPointRange || offset === null) return null
    return clamp((offset - snapPointRange.minOffset) / snapPointRange.range, 0, 1)
  })

  #swipeDirections = $derived.by<SwipeDirection[]>(() => {
    const direction = this.#drawer.swipeDirection
    if (this.#hasSnapPoints && (direction === 'down' || direction === 'up')) {
      return direction === 'down' ? ['down', 'up'] : ['up', 'down']
    }
    return [direction]
  })

  get swiping(): boolean {
    return this.#swipe.swiping
  }

  get swipeStrength(): number | null {
    return this.#releaseStrength
  }

  get releasing(): boolean {
    return this.#releasing
  }

  get dragStyles(): Record<string, string> {
    return this.#swipe.dragStyles
  }

  get activeSnapPointOffset(): number | null {
    return this.#snapPointsState.activeSnapPointOffset
  }

  constructor(dialog: DialogRoot, drawer: DrawerRoot, provider?: DrawerProviderContext) {
    this.#dialog = dialog
    this.#drawer = drawer
    this.#provider = provider

    this.#snapPointsState = new DrawerSnapPoints(() => ({
      viewportElement: this.#dialog.viewportElement,
      snapPoints: this.#drawer.snapPoints,
      activeSnapPoint: this.#drawer.activeSnapPoint,
      popupHeight: this.#drawer.popupHeight
    }))

    this.#swipe = new SwipeDismiss(() => ({
      enabled: this.#dialog.mounted && !this.#nestedDrawerOpen,
      directions: this.#swipeDirections,
      element: this.#dialog.popupElement,
      ignoreSelectorWhenTouch: false,
      ignoreScrollableAncestors: true,
      movementCssVars: {
        x: DRAWER_SWIPE_MOVEMENT_X_VAR,
        y: DRAWER_SWIPE_MOVEMENT_Y_VAR
      },
      onSwipeStart: this.#clearTextSelection,
      onSwipingChange: this.#syncSwipingState,
      swipeThreshold: ({ element, direction }) => getBaseSwipeThreshold(element, direction),
      canStart: this.#canStart,
      onProgress: this.#applySwipeProgress,
      onRelease: this.#settleSwipeRelease,
      onDismiss: this.#dismissDrawer
    }))

    $effect(this.#controlledDismissFrame.disposeEffect)

    $effect(() => {
      const rootElement = this.#dialog.viewportElement ?? this.#dialog.popupElement
      if (!rootElement) return
      return on(rootElement.ownerDocument, 'touchmove', this.#ontouchmove, {
        passive: false,
        capture: true
      })
    })

    $effect(() => {
      if (!this.#snapPointRange || this.#swipe.swiping) return
      this.#applyProgress(
        !this.#dialog.open || this.#dialog.nested ? 0 : (this.#snapPointProgress ?? 0)
      )
    })

    $effect(() => {
      if (this.#dialog.open) {
        if (!this.#drawer.swipeAreaActive) this.#swipe.reset()
        this.#clearRelease()
      }
    })

    $effect(() => {
      const parent = this.#drawer.parent
      if (!parent) return
      if (!this.#dialog.open) {
        parent.onNestedSwipeProgressChange(0)
      }
      return () => {
        parent.onNestedSwipeProgressChange(0)
      }
    })

    $effect(() => {
      const backdropElement = untrack(() => this.#dialog.backdropElement)

      return () => {
        this.#provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 })
        setBackdropSwipingAttribute(backdropElement, false)
        const currentBackdrop = this.#dialog.backdropElement
        if (currentBackdrop !== backdropElement) {
          setBackdropSwipingAttribute(currentBackdrop, false)
        }
        this.#finishNestedSwipe()
      }
    })
  }

  attach = (node: HTMLElement): (() => void) => {
    const cleanups = [
      on(node, 'pointerdown', (event) => this.#startPointerSwipe(event, node.ownerDocument)),
      on(node, 'pointermove', (event) => {
        if (event.pointerType === 'touch') return
        this.#swipe.move(event, node)
      }),
      on(node, 'pointerup', this.#endPointerSwipe),
      on(node, 'pointercancel', this.#endPointerSwipe),
      on(node, 'touchstart', (event) => this.#startTouchSwipe(event, node.ownerDocument)),
      on(node, 'touchend', this.#endTouchSwipe),
      on(node, 'touchcancel', this.#endTouchSwipe)
    ]
    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }

  #updateNestedSwipeActive(details?: {
    direction?: SwipeDirection
    deltaX: number
    deltaY: number
  }): void {
    if (this.#nestedSwipeActive || !details) return
    const direction = details.direction ?? this.#drawer.swipeDirection
    const delta = getDisplacement(direction, details.deltaX, details.deltaY)
    if (Math.abs(delta) < MIN_SWIPE_THRESHOLD) return
    this.#nestedSwipeActive = true
    this.#drawer.parent?.onNestedSwipingChange(true)
  }

  #finishNestedSwipe(): void {
    if (!this.#nestedSwipeActive) return
    this.#nestedSwipeActive = false
    this.#drawer.parent?.onNestedSwipingChange(false)
  }

  #clearRelease(): void {
    this.#drawer.swipeDismissed = false
    this.#releasing = false
    this.#releaseStrength = null
  }

  #applyProgress(resolvedProgress: number): void {
    const swipeProgress = this.#dialog.open && !this.#dialog.nested ? resolvedProgress : 0
    const height = this.#drawer.frontmostHeight

    this.#provider?.setVisualState({
      swipeProgress,
      frontmostHeight: swipeProgress > 0 ? height : 0
    })

    const backdropElement = this.#dialog.backdropElement
    if (!backdropElement) return

    if (swipeProgress <= 0) {
      resetBackdropSwipeVars(backdropElement)
      return
    }

    setBackdropSwipeVars(backdropElement, swipeProgress, height)
  }

  #releaseScalar(
    direction: SwipeDirection,
    { deltaX, deltaY, velocityX, velocityY, releaseVelocityX, releaseVelocityY }: ReleaseDetails
  ): number | null {
    const popupElement = this.#dialog.popupElement
    if (!popupElement) return null

    const size =
      direction === 'left' || direction === 'right'
        ? popupElement.offsetWidth
        : popupElement.offsetHeight
    if (size <= 0) return null

    const snapPointBaseOffset =
      (direction === 'down' || direction === 'up') && this.#hasSnapPoints
        ? (this.activeSnapPointOffset ?? 0)
        : 0
    const translationAlongDirection =
      snapPointBaseOffset + getDisplacement(direction, deltaX, deltaY)
    const remainingDistance = Math.max(0, size - translationAlongDirection)
    if (remainingDistance <= 0) return null

    const releaseVelocity = getDisplacement(direction, releaseVelocityX, releaseVelocityY)
    const directionalVelocity =
      Math.abs(releaseVelocity) > 0
        ? releaseVelocity
        : getDisplacement(direction, velocityX, velocityY)
    if (directionalVelocity <= MIN_SWIPE_RELEASE_VELOCITY) return null

    const clampedVelocity = clamp(
      directionalVelocity,
      MIN_SWIPE_RELEASE_VELOCITY,
      MAX_SWIPE_RELEASE_VELOCITY
    )
    const durationMs = clamp(
      remainingDistance / clampedVelocity,
      MIN_SWIPE_RELEASE_DURATION_MS,
      MAX_SWIPE_RELEASE_DURATION_MS
    )
    const normalizedDuration =
      (durationMs - MIN_SWIPE_RELEASE_DURATION_MS) /
      (MAX_SWIPE_RELEASE_DURATION_MS - MIN_SWIPE_RELEASE_DURATION_MS)
    return (
      MIN_SWIPE_RELEASE_SCALAR +
      normalizedDuration * (MAX_SWIPE_RELEASE_SCALAR - MIN_SWIPE_RELEASE_SCALAR)
    )
  }

  #clearTextSelection = (event: PointerEvent | TouchEvent): void => {
    if ('touches' in event || event.pointerType === 'touch') return

    const popupElement = this.#dialog.popupElement
    if (!popupElement) return

    const selection = popupElement.ownerDocument.getSelection()
    if (!selection || selection.isCollapsed) return

    const [anchorElement, focusElement] = selectionEndpointElements(selection)

    if (!contains(popupElement, anchorElement) && !contains(popupElement, focusElement)) {
      return
    }

    selection.removeAllRanges()
  }

  #syncSwipingState = (swiping: boolean): void => {
    setBackdropSwipingAttribute(this.#dialog.backdropElement, swiping)
    if (!swiping && !this.#drawer.parent) {
      this.#finishNestedSwipe()
    }
  }

  #canStart = (
    position: { x: number; y: number },
    details: { nativeEvent: PointerEvent | TouchEvent }
  ): boolean => {
    const popupElement = this.#dialog.popupElement
    if (!popupElement) return false

    const doc = popupElement.ownerDocument
    const elementAtPoint = getElementAtPoint(popupElement.ownerDocument, position.x, position.y)
    if (!elementAtPoint || !contains(popupElement, elementAtPoint)) {
      return false
    }

    const nativeEvent = details.nativeEvent
    const touchLike =
      'touches' in nativeEvent ||
      ('pointerType' in nativeEvent && nativeEvent.pointerType === 'touch')

    if (touchLike && shouldIgnoreSwipeForTextSelection(doc, popupElement)) {
      return false
    }

    return true
  }

  #applySwipeProgress = (
    progress: number,
    details?: { direction?: SwipeDirection; deltaX: number; deltaY: number }
  ): void => {
    this.#updateNestedSwipeActive(details)

    const snapPointRange = this.#snapPointRange
    const popupHeight = this.#drawer.popupHeight

    let resolvedProgress = progress
    if (snapPointRange && popupHeight > 0) {
      const baseOffset = this.activeSnapPointOffset ?? snapPointRange.minOffset
      if (details && Number.isFinite(details.deltaY)) {
        const nextOffset = clamp(baseOffset + details.deltaY, 0, popupHeight)
        resolvedProgress = clamp(
          (nextOffset - snapPointRange.minOffset) / snapPointRange.range,
          0,
          1
        )
      } else if (this.#snapPointProgress !== null) {
        resolvedProgress = this.#snapPointProgress
      }
    }

    const parent = this.#drawer.parent
    if (parent) {
      const nestedSwipeProgress = this.#dialog.open ? resolvedProgress : 0
      parent.onNestedSwipeProgressChange(nestedSwipeProgress)

      if (nestedSwipeProgress <= 0) {
        this.#finishNestedSwipe()
      }
    }

    this.#applyProgress(resolvedProgress)
  }

  #startRelease(direction: SwipeDirection, details: ReleaseDetails): void {
    const popupElement = this.#dialog.popupElement
    if (!popupElement) return

    this.#finishNestedSwipe()

    popupElement.style.removeProperty('transition')
    flushSync(() => {
      this.#drawer.swipeDismissed = true
      this.#releasing = true
      this.#releaseStrength = this.#releaseScalar(direction, details)
    })
  }

  #settleSwipeRelease = (details: ReleaseDetails): boolean | undefined => {
    return this.#hasSnapPoints
      ? this.#releaseWithSnapPoints(details)
      : this.#releaseWithoutSnapPoints(details)
  }

  #releaseWithoutSnapPoints(details: ReleaseDetails): boolean | undefined {
    const { deltaX, deltaY, direction, velocityX, velocityY } = details
    const element = this.#dialog.popupElement
    if (!direction || !element) {
      this.#clearRelease()
      return undefined
    }

    const directionalDelta = getDisplacement(direction, deltaX, deltaY)
    if (directionalDelta <= 0) {
      this.#clearRelease()
      return false
    }

    if (getDisplacement(direction, velocityX, velocityY) >= FAST_SWIPE_VELOCITY) {
      this.#startRelease(direction, details)
      return true
    }

    const shouldClose = directionalDelta > getBaseSwipeThreshold(element, direction)
    if (shouldClose) this.#startRelease(direction, details)
    else this.#clearRelease()
    return shouldClose
  }

  #releaseWithSnapPoints(details: ReleaseDetails): boolean | undefined {
    const { deltaY, velocityY, releaseVelocityY } = details
    const swipeDirection = this.#drawer.swipeDirection
    const popupHeight = this.#drawer.popupHeight
    const resolvedSnapPoints = this.#snapPointsState.resolvedSnapPoints

    if (swipeDirection !== 'down' && swipeDirection !== 'up') {
      this.#clearRelease()
      return undefined
    }
    if (!popupHeight) {
      this.#clearRelease()
      return false
    }
    if (resolvedSnapPoints.length === 0) {
      this.#clearRelease()
      return undefined
    }

    const dragDelta = swipeDirection === 'down' ? deltaY : -deltaY
    const dragDirection = Math.sign(dragDelta)
    const releaseDirectionalVelocity =
      swipeDirection === 'down' ? releaseVelocityY : -releaseVelocityY
    const fallbackDirectionalVelocity = swipeDirection === 'down' ? velocityY : -velocityY
    let resolvedDirectionalVelocity = releaseDirectionalVelocity
    if (dragDirection !== 0 && Math.abs(dragDelta) >= MIN_SWIPE_THRESHOLD) {
      const velocityDirection = Math.sign(resolvedDirectionalVelocity)
      if (velocityDirection !== 0 && velocityDirection !== dragDirection) {
        resolvedDirectionalVelocity = fallbackDirectionalVelocity
      }
    }

    const currentOffset = this.activeSnapPointOffset ?? 0
    const dragTargetOffset = clamp(currentOffset + dragDelta, 0, popupHeight)
    const velocityOffset =
      Math.abs(resolvedDirectionalVelocity) >= SNAP_VELOCITY_THRESHOLD
        ? clamp(resolvedDirectionalVelocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY) *
          SNAP_VELOCITY_MULTIPLIER
        : 0
    const targetOffset = this.#drawer.snapToSequentialPoints
      ? dragTargetOffset
      : clamp(dragTargetOffset + velocityOffset, 0, popupHeight)

    const closeFromSnapPoints = (): true => {
      this.#pendingCloseSnapPoint = this.#drawer.activeSnapPoint
      this.#drawer.setActiveSnapPoint(null)
      this.#startRelease(swipeDirection, details)
      return true
    }

    if (this.#drawer.snapToSequentialPoints) {
      const orderedSnapPoints = resolvedSnapPoints.toSorted(
        (first, second) => first.offset - second.offset
      )

      const currentIndex = findClosestSnapPoint(orderedSnapPoints, currentOffset).index
      let targetSnapPoint = findClosestSnapPoint(orderedSnapPoints, targetOffset).point

      const velocityDirection = Math.sign(resolvedDirectionalVelocity)
      const shouldAdvance =
        dragDirection !== 0 &&
        velocityDirection !== 0 &&
        velocityDirection === dragDirection &&
        Math.abs(resolvedDirectionalVelocity) >= SNAP_VELOCITY_THRESHOLD
      let effectiveTargetOffset = targetOffset

      if (shouldAdvance) {
        const adjacentIndex = clamp(currentIndex + dragDirection, 0, orderedSnapPoints.length - 1)
        if (adjacentIndex !== currentIndex) {
          const adjacentPoint = orderedSnapPoints[adjacentIndex]
          const shouldForceAdjacent =
            dragDirection > 0
              ? targetOffset < adjacentPoint.offset
              : targetOffset > adjacentPoint.offset
          if (shouldForceAdjacent) {
            targetSnapPoint = adjacentPoint
            effectiveTargetOffset = adjacentPoint.offset
          }
        } else if (dragDirection > 0) {
          return closeFromSnapPoints()
        }
      }

      const closeDistance = Math.abs(effectiveTargetOffset - popupHeight)
      const snapDistance = Math.abs(effectiveTargetOffset - targetSnapPoint.offset)
      if (closeDistance < snapDistance) {
        return closeFromSnapPoints()
      }

      this.#drawer.setActiveSnapPoint(targetSnapPoint.value)
      this.#clearRelease()
      return false
    }

    if (resolvedDirectionalVelocity >= FAST_SWIPE_VELOCITY && dragDelta > 0) {
      return closeFromSnapPoints()
    }

    const closestSnapPoint = findClosestSnapPoint(resolvedSnapPoints, targetOffset).point
    const closestDistance = Math.abs(targetOffset - closestSnapPoint.offset)

    const closeDistance = Math.abs(targetOffset - popupHeight)
    if (closeDistance < closestDistance) {
      return closeFromSnapPoints()
    }

    this.#drawer.setActiveSnapPoint(closestSnapPoint.value)
    this.#clearRelease()
    return false
  }

  #dismissDrawer = (): void => {
    this.#provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 })

    const backdropElement = this.#dialog.backdropElement
    if (backdropElement) resetBackdropSwipeVars(backdropElement)

    this.#dialog.setOpen(false, REASONS.swipe)

    if (this.#dialog.open) {
      this.#controlledDismissFrame.request(() => {
        if (this.#dialog.open) {
          const savedSnapPoint = this.#pendingCloseSnapPoint
          if (savedSnapPoint !== undefined) {
            this.#drawer.setActiveSnapPoint(savedSnapPoint)
          }
          this.#pendingCloseSnapPoint = undefined
          this.#clearRelease()
          this.#swipe.reset()
        } else {
          this.#pendingCloseSnapPoint = undefined
        }
      })
      return
    }

    this.#pendingCloseSnapPoint = undefined
    this.#drawer.swipeDismissed = true
  }

  #ontouchmove = (event: TouchEvent): void => {
    if (this.#ignoreTouchSwipe) return

    const scrollState = this.#touchScroll
    const touch = event.touches[0]
    if (!touch || !scrollState) return

    this.#processTouchMove(event, scrollState, touch)
    updateTouchScrollPosition(scrollState, touch)
  }

  #processTouchMove(event: TouchEvent, scrollState: TouchScroll, touch: Touch): void {
    const rootElement = this.#dialog.viewportElement ?? this.#dialog.popupElement
    if (!rootElement) return
    const doc = rootElement.ownerDocument
    const isVerticalScrollAxis = this.#isVerticalScrollAxis

    // Avoid blocking pinch zoom or text selection adjustments on iOS Safari.
    if (event.touches.length === 2) return

    const drawerAxisDelta = isVerticalScrollAxis
      ? touch.clientY - scrollState.lastY
      : touch.clientX - scrollState.lastX

    const allowTouchMove = shouldIgnoreSwipeForTextSelection(doc, rootElement)

    if (allowTouchMove || !this.#dialog.open || !this.#dialog.mounted || this.#nestedDrawerOpen) {
      return
    }

    if (shouldYieldTouchMove(scrollState, event, touch, isVerticalScrollAxis)) return

    const scrollTarget = scrollState.scrollTarget
    if (!scrollTarget || scrollTarget === doc.documentElement || scrollTarget === doc.body) {
      if (event.cancelable) event.preventDefault()
      // Claim the gesture before Svelte's delegated touch handlers see it; dispatching the
      // move through the framework re-rasterizes the popup content on every frame.
      event.stopPropagation()
      this.#swipe.move(event, rootElement)
      return
    }

    const scrollAxis = this.#scrollAxis
    if (!hasScrollableContentOnAxis(scrollTarget, scrollAxis)) {
      if (event.cancelable) event.preventDefault()
      event.stopPropagation()
      return
    }

    if (drawerAxisDelta !== 0) {
      const canSwipeFromScrollEdge = canSwipeFromScrollEdgeOnMove(
        scrollTarget,
        scrollAxis,
        this.#drawer.swipeDirection,
        drawerAxisDelta
      )

      if (!scrollState.allowSwipe) {
        if (event.cancelable && canSwipeFromScrollEdge) {
          scrollState.allowSwipe = true
          event.preventDefault()
        } else {
          scrollState.allowSwipe = false
        }
      } else if (event.cancelable) {
        event.preventDefault()
      }
    }

    if (scrollState.allowSwipe === true) {
      event.stopPropagation()
      this.#swipe.move(event, rootElement)
    }
  }

  #startPointerSwipe(event: PointerEvent, root: Node): void {
    this.#lastPointerType = event.pointerType
    this.#ignoreNextTouchStartFromPen = event.pointerType === 'pen'

    if (!this.#dialog.open || !this.#dialog.mounted || this.#nestedDrawerOpen) return

    const elementAtPoint = getElementAtPoint(root, event.clientX, event.clientY)
    if (isSwipeIgnoredTarget(elementAtPoint) || isDrawerContentTarget(elementAtPoint)) {
      return
    }

    if (event.pointerType === 'touch') return

    this.#swipe.start(event)
  }

  #endPointerSwipe = (event: PointerEvent): void => {
    this.#lastPointerType = ''
    if (event.pointerType === 'touch') return
    this.#swipe.end(event)
  }

  #startTouchSwipe(event: TouchEvent, root: Node): void {
    if (this.#lastPointerType === 'pen' && this.#ignoreNextTouchStartFromPen) {
      this.#ignoreNextTouchStartFromPen = false
      this.#ignoreTouchSwipe = false
      this.#touchScroll = null
      return
    }

    if (!this.#dialog.open || !this.#dialog.mounted || this.#nestedDrawerOpen) {
      this.#ignoreTouchSwipe = false
      this.#touchScroll = null
      return
    }

    const touch = event.touches[0]
    if (!touch) return

    if (isEventOnRangeInput(event)) {
      this.#ignoreTouchSwipe = false
      this.#touchScroll = null
      return
    }

    const elementAtPoint = getElementAtPoint(root, touch.clientX, touch.clientY)
    this.#ignoreTouchSwipe = isSwipeIgnoredTarget(elementAtPoint)
    if (this.#ignoreTouchSwipe) {
      this.#touchScroll = null
      return
    }

    const rootElement = this.#dialog.viewportElement ?? this.#dialog.popupElement
    const eventTarget = getTarget(event)
    const target = isElement(eventTarget) ? eventTarget : null
    if (rootElement && target && !contains(rootElement, target)) {
      this.#ignoreTouchSwipe = true
      this.#touchScroll = null
      return
    }

    const scrollAxis = this.#scrollAxis
    let scrollTarget: HTMLElement | null = null
    let hasCrossAxisScrollableContent = false
    if (rootElement && target) {
      scrollTarget = findScrollableTouchTarget(target, rootElement, scrollAxis)
      hasCrossAxisScrollableContent =
        findScrollableTouchTarget(
          target,
          rootElement,
          this.#isVerticalScrollAxis ? 'horizontal' : 'vertical'
        ) != null
    }

    let allowSwipe: boolean | null = null
    if (scrollTarget) {
      const canSwipeFromEdge = isAtSwipeStartEdge(
        scrollTarget,
        scrollAxis,
        this.#drawer.swipeDirection
      )
      allowSwipe = canSwipeFromEdge ? null : false
    }

    this.#touchScroll = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      scrollTarget,
      hasCrossAxisScrollableContent,
      allowSwipe,
      preserveNativeCrossAxisScroll: false,
      drawerAxisAttributed: false
    }

    this.#swipe.start(event)
  }

  #endTouchSwipe = (event: TouchEvent): void => {
    this.#ignoreTouchSwipe = false
    this.#touchScroll = null
    this.#lastPointerType = ''
    this.#ignoreNextTouchStartFromPen = false
    this.#swipe.end(event)
  }
}
