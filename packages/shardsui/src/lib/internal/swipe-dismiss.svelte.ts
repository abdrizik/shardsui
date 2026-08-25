import { isElement, isHTMLElement } from '@floating-ui/utils/dom'
import { clamp } from './clamp'
import { contains, getTarget } from './dom'
import { getElementAtPoint } from './get-element-at-point'
import { findScrollableTouchTarget, hasScrollableAncestor, type ScrollAxis } from './scrollable'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

type SwipeDismissDetails = {
  nativeEvent: PointerEvent | TouchEvent
  direction: SwipeDirection | undefined
}

type SwipeDismissProgressDetails = {
  deltaX: number
  deltaY: number
  direction: SwipeDirection | undefined
}

type SwipeDismissReleaseDetails = {
  event: PointerEvent | TouchEvent
  direction: SwipeDirection | undefined
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
  releaseVelocityX: number
  releaseVelocityY: number
}

type SwipeDismissOptions = {
  enabled: boolean
  directions: SwipeDirection[]
  element: HTMLElement | null
  movementCssVars: { x: string; y: string }
  swipeThreshold?:
    | ((details: { element: HTMLElement; direction: SwipeDirection }) => number)
    | undefined
  canStart?:
    | ((position: { x: number; y: number }, details: SwipeDismissDetails) => boolean)
    | undefined
  ignoreScrollableAncestors?: boolean | undefined
  ignoreSelectorWhenTouch?: boolean | undefined
  trackDrag?: boolean | undefined
  onSwipeStart?: ((event: PointerEvent | TouchEvent) => void) | undefined
  onProgress?: ((progress: number, details?: SwipeDismissProgressDetails) => void) | undefined
  onCancel?: ((event: PointerEvent | TouchEvent) => void) | undefined
  onSwipingChange?: ((swiping: boolean) => void) | undefined
  onRelease?: ((details: SwipeDismissReleaseDetails) => boolean | void) | undefined
  onDismiss?:
    | ((event: PointerEvent | TouchEvent, details: { direction: SwipeDirection }) => void)
    | undefined
}

const DEFAULT_SWIPE_THRESHOLD = 40
const REVERSE_CANCEL_THRESHOLD = 10
const MIN_DRAG_THRESHOLD = 1

const MIN_VELOCITY_DURATION_MS = 50
const MIN_RELEASE_VELOCITY_DURATION_MS = 16
const MAX_RELEASE_VELOCITY_AGE_MS = 80
const DEFAULT_IGNORE_SELECTOR = 'button,a,input,select,textarea,label,[role="button"]'

export function getDisplacement(
  direction: SwipeDirection | undefined,
  deltaX: number,
  deltaY: number
): number {
  switch (direction) {
    case 'up':
      return -deltaY
    case 'down':
      return deltaY
    case 'left':
      return -deltaX
    case 'right':
      return deltaX
    default:
      return 0
  }
}

export function getElementTransform(element: HTMLElement): {
  x: number
  y: number
  scale: number
} {
  const win = element.ownerDocument.defaultView ?? window
  const computedStyle = win.getComputedStyle(element)
  const transform = computedStyle.transform
  let translateX = 0
  let translateY = 0
  let scale = 1

  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/)
    if (matrix) {
      const values = matrix[1].split(', ').map(parseFloat)
      if (values.length === 6) {
        translateX = values[4]
        translateY = values[5]
        scale = Math.sqrt(values[0] * values[0] + values[1] * values[1])
      } else if (values.length === 16) {
        translateX = values[12]
        translateY = values[13]
        scale = values[0]
      }
    }
  }

  return { x: translateX, y: translateY, scale }
}

function getValidTimeStamp(timeStamp: number): number | null {
  return Number.isFinite(timeStamp) && timeStamp > 0 ? timeStamp : null
}

function hasPrimaryMouseButton(buttons: number): boolean {
  // `buttons` is a bitmask and the primary button is bit 0.
  return buttons % 2 === 1
}

export function safelyChangePointerCapture(
  element: HTMLElement,
  pointerId: number,
  method: 'setPointerCapture' | 'releasePointerCapture'
) {
  if (typeof element[method] !== 'function') return

  try {
    element[method](pointerId)
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error
  }
}

function ownerDocumentOf(element: Element | null): Document {
  return element?.ownerDocument ?? document
}

function getPrimaryPointerPosition(
  event: PointerEvent | TouchEvent
): { x: number; y: number } | null {
  if ('touches' in event) {
    const touch = event.touches[0]
    return touch ? { x: touch.clientX, y: touch.clientY } : null
  }
  return { x: event.clientX, y: event.clientY }
}

function isTouchLikeEvent(event: PointerEvent | TouchEvent): boolean {
  if ('touches' in event) return true
  return event.pointerType === 'touch'
}

function signedSqrt(value: number): number {
  return value >= 0 ? Math.sqrt(value) : -Math.sqrt(-value)
}

function dampAxis(delta: number, allowNegative: boolean, allowPositive: boolean): number {
  if (!allowNegative && delta < 0) return signedSqrt(delta)
  if (!allowPositive && delta > 0) return signedSqrt(delta)
  return delta
}

export class SwipeDismiss {
  swiping = $state(false)
  direction = $state<SwipeDirection | undefined>(undefined)

  #dragOffset = $state.raw<{ x: number; y: number }>({ x: 0, y: 0 })
  #initialTransform = $state.raw<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 })

  #isRealSwipe = false
  #lockedAxis: 'horizontal' | 'vertical' | null = null
  #dragStartPos = { x: 0, y: 0 }
  #dragOffsetCurrent = { x: 0, y: 0 }
  #lastMovePos: { x: number; y: number } | null = null
  #intendedSwipeDirection: SwipeDirection | undefined
  #maxSwipeDisplacement = 0
  #cancelledSwipe = false
  #swipeCancelBaseline = { x: 0, y: 0 }
  #isFirstPointerMove = false
  #pendingSwipeStartPos: { x: number; y: number } | null = null
  #swipeFromScrollable = false
  #sawPrimaryButtonsOnMove = false
  #elementSize = { width: 0, height: 0 }
  #swipeProgress = 0
  #swipeThresholdValue = DEFAULT_SWIPE_THRESHOLD
  #swipeStartTime: number | null = null
  #lastDragSample: { x: number; y: number; time: number } | null = null
  #lastDragVelocity = { x: 0, y: 0 }
  #lastProgressDetails: SwipeDismissProgressDetails | null = null
  // Untracked mirror of `swiping`: `reset()` runs inside a consumer `$effect`, so reading the
  // `$state` here would subscribe that effect to it and every `swiping` write would re-run the
  // effect and reset the gesture.
  #swipingUntracked = false

  #options: () => SwipeDismissOptions

  constructor(options: () => SwipeDismissOptions) {
    this.#options = options
  }

  #enabled = $derived.by(() => this.#options().enabled)
  #directions = $derived.by(() => this.#options().directions)
  #element = $derived.by(() => this.#options().element)
  #movementCssVars = $derived.by(() => this.#options().movementCssVars)
  #ignoreSelectorWhenTouch = $derived.by(() => this.#options().ignoreSelectorWhenTouch ?? true)
  #ignoreScrollableAncestors = $derived.by(() => this.#options().ignoreScrollableAncestors ?? false)
  #trackDrag = $derived.by(() => this.#options().trackDrag ?? true)

  #directionsState = $derived.by(() => {
    const directions = this.#directions
    const allowLeft = directions.includes('left')
    const allowRight = directions.includes('right')
    const allowUp = directions.includes('up')
    const allowDown = directions.includes('down')
    const hasHorizontal = allowLeft || allowRight
    const hasVertical = allowUp || allowDown
    const primaryDirection = directions.length === 1 ? directions[0] : undefined
    const scrollAxes: ScrollAxis[] = []
    if (hasVertical) scrollAxes.push('vertical')
    if (hasHorizontal) scrollAxes.push('horizontal')
    return {
      allowLeft,
      allowRight,
      allowUp,
      allowDown,
      hasHorizontal,
      hasVertical,
      primaryDirection,
      scrollAxes
    }
  })

  dragStyles = $derived.by((): Record<string, string> => {
    const movementCssVars = this.#movementCssVars
    const dragOffset = this.#trackDrag ? this.#dragOffset : this.#dragOffsetCurrent
    const initialTransform = this.#initialTransform

    const styles: Record<string, string> = {}

    if (this.swiping) {
      styles.transition = 'none'
      styles.transform = `translate3d(${dragOffset.x}px,${dragOffset.y}px,0) scale(${initialTransform.scale})`
    }
    styles[movementCssVars.x] = `${dragOffset.x - initialTransform.x}px`
    styles[movementCssVars.y] = `${dragOffset.y - initialTransform.y}px`
    return styles
  })

  #setSwiping(nextSwiping: boolean) {
    if (this.#swipingUntracked === nextSwiping) return
    this.#swipingUntracked = nextSwiping
    this.swiping = nextSwiping
    this.#options().onSwipingChange?.(nextSwiping)
  }

  #resolveSwipeThreshold(direction: SwipeDirection | undefined) {
    if (!direction) return

    const swipeThreshold = this.#options().swipeThreshold
    if (!swipeThreshold) {
      this.#swipeThresholdValue = DEFAULT_SWIPE_THRESHOLD
      return
    }

    const element = this.#element
    if (!element) return

    const value = swipeThreshold({ element, direction })
    this.#swipeThresholdValue = Math.max(0, value)
  }

  #updateSwipeProgress(progress: number, details?: SwipeDismissProgressDetails) {
    const nextProgress = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0
    const progressChanged = nextProgress !== this.#swipeProgress
    let detailsChanged = false

    if (details) {
      const last = this.#lastProgressDetails
      detailsChanged =
        !last ||
        last.deltaX !== details.deltaX ||
        last.deltaY !== details.deltaY ||
        last.direction !== details.direction
    }

    if (!progressChanged && !detailsChanged) return

    this.#swipeProgress = nextProgress
    if (details) {
      this.#lastProgressDetails = details
    } else if (progressChanged) {
      this.#lastProgressDetails = null
    }
    this.#options().onProgress?.(nextProgress, details)
  }

  #recordDragSample(offset: { x: number; y: number }, timeStamp: number | null) {
    if (timeStamp === null) return

    const last = this.#lastDragSample
    if (last && timeStamp > last.time) {
      const durationMs = Math.max(timeStamp - last.time, MIN_RELEASE_VELOCITY_DURATION_MS)
      this.#lastDragVelocity = {
        x: (offset.x - last.x) / durationMs,
        y: (offset.y - last.y) / durationMs
      }
    }

    this.#lastDragSample = { x: offset.x, y: offset.y, time: timeStamp }
  }

  reset = () => {
    this.direction = undefined
    this.#setSwiping(false)
    this.#isRealSwipe = false
    this.#dragOffset = { x: 0, y: 0 }
    this.#initialTransform = { x: 0, y: 0, scale: 1 }
    this.#lockedAxis = null
    this.#updateSwipeProgress(0)

    this.#swipeThresholdValue = DEFAULT_SWIPE_THRESHOLD
    this.#dragStartPos = { x: 0, y: 0 }
    this.#dragOffsetCurrent = { x: 0, y: 0 }
    this.#intendedSwipeDirection = undefined
    this.#maxSwipeDisplacement = 0
    this.#cancelledSwipe = false
    this.#swipeCancelBaseline = { x: 0, y: 0 }
    this.#isFirstPointerMove = false
    this.#lastMovePos = null
    this.#pendingSwipeStartPos = null
    this.#swipeFromScrollable = false
    this.#sawPrimaryButtonsOnMove = false
    this.#elementSize = { width: 0, height: 0 }
    this.#swipeStartTime = null
    this.#lastDragSample = null
    this.#lastDragVelocity = { x: 0, y: 0 }
    this.#lastProgressDetails = null
  }

  #getTargetAtPoint(position: { x: number; y: number }, nativeEvent: Event): Element | null {
    const target =
      getElementAtPoint(this.#element?.ownerDocument, position.x, position.y) ??
      getTarget(nativeEvent)
    return isElement(target) ? target : null
  }

  #findGestureScrollableTouchTarget(
    target: EventTarget | null,
    root: HTMLElement
  ): HTMLElement | null {
    const { hasHorizontal, hasVertical } = this.#directionsState
    if (hasHorizontal && !hasVertical) {
      return findScrollableTouchTarget(target, root, 'horizontal')
    }
    if (hasVertical && !hasHorizontal) {
      return findScrollableTouchTarget(target, root, 'vertical')
    }
    return (
      findScrollableTouchTarget(target, root, 'vertical') ??
      findScrollableTouchTarget(target, root, 'horizontal')
    )
  }

  #startSwipeAtPosition(
    event: PointerEvent | TouchEvent,
    position: { x: number; y: number },
    ignoreScrollable = false
  ): boolean {
    const element = this.#element
    this.#swipeFromScrollable = false
    const touchLike = isTouchLikeEvent(event)
    const target = this.#getTargetAtPoint(position, event)

    const doc = ownerDocumentOf(element)
    const body = doc.body

    const scrollableTarget =
      touchLike && body ? this.#findGestureScrollableTouchTarget(target, body) : null
    if (scrollableTarget && !ignoreScrollable) {
      return false
    }
    this.#swipeFromScrollable = Boolean(scrollableTarget && ignoreScrollable)

    const isInteractiveElement = target ? target.closest(DEFAULT_IGNORE_SELECTOR) : false
    if (isInteractiveElement && (!touchLike || this.#ignoreSelectorWhenTouch)) {
      return false
    }

    const { primaryDirection, scrollAxes } = this.#directionsState
    if (
      this.#ignoreScrollableAncestors &&
      element &&
      isHTMLElement(target) &&
      scrollAxes.length > 0
    ) {
      if (!ignoreScrollable && hasScrollableAncestor(target, element, scrollAxes)) {
        return false
      }
    }

    this.#cancelledSwipe = false
    this.#intendedSwipeDirection = undefined
    this.#maxSwipeDisplacement = 0

    this.#dragStartPos = position
    this.#swipeStartTime = getValidTimeStamp(event.timeStamp)
    this.#swipeCancelBaseline = position
    this.#lastMovePos = position

    if (element) {
      this.#elementSize = { width: element.offsetWidth, height: element.offsetHeight }
      this.#resolveSwipeThreshold(primaryDirection)
      const transform = getElementTransform(element)
      this.#initialTransform = transform
      this.#dragOffsetCurrent = { x: transform.x, y: transform.y }
      this.#dragOffset = { x: transform.x, y: transform.y }
      this.#recordDragSample({ x: transform.x, y: transform.y }, this.#swipeStartTime)

      if (!('touches' in event)) {
        safelyChangePointerCapture(element, event.pointerId, 'setPointerCapture')
      }
    }

    this.#options().onSwipeStart?.(event)

    this.#setSwiping(true)
    this.#isRealSwipe = false
    this.#lockedAxis = null
    this.#isFirstPointerMove = true
    this.#updateSwipeProgress(0)

    return true
  }

  #resetPendingSwipeState() {
    this.#pendingSwipeStartPos = null
    this.#swipeFromScrollable = false
    this.#lastMovePos = null
  }

  #cancelSwipeInteraction(event: PointerEvent) {
    this.#resetPendingSwipeState()

    if (!this.#swipingUntracked) return

    this.#setSwiping(false)
    this.#isRealSwipe = false
    this.#lockedAxis = null

    const { x, y } = this.#initialTransform
    this.#dragOffsetCurrent = { x, y }
    this.#dragOffset = { x, y }
    this.direction = undefined
    this.#sawPrimaryButtonsOnMove = false

    const element = this.#element
    if (element) {
      safelyChangePointerCapture(element, event.pointerId, 'releasePointerCapture')
    }

    this.#updateSwipeProgress(0, {
      deltaX: 0,
      deltaY: 0,
      direction: undefined
    })

    this.#options().onCancel?.(event)
  }

  #applyDirectionalDamping(deltaX: number, deltaY: number) {
    const { allowLeft, allowRight, allowUp, allowDown, hasHorizontal, hasVertical } =
      this.#directionsState

    return {
      x: hasHorizontal ? dampAxis(deltaX, allowLeft, allowRight) : signedSqrt(deltaX),
      y: hasVertical ? dampAxis(deltaY, allowUp, allowDown) : signedSqrt(deltaY)
    }
  }

  #canSwipeFromScrollEdgeOnPendingMove(
    scrollTarget: HTMLElement,
    deltaX: number,
    deltaY: number
  ): boolean | null {
    const { allowDown, allowLeft, allowRight, allowUp, hasHorizontal, hasVertical } =
      this.#directionsState
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    const useVerticalAxis =
      hasVertical && deltaY !== 0 && (!hasHorizontal || absDeltaY >= absDeltaX)

    if (useVerticalAxis) {
      const maxScrollTop = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight)
      const atTop = scrollTarget.scrollTop <= 0
      const atBottom = scrollTarget.scrollTop >= maxScrollTop
      const movingDown = deltaY > 0
      const movingUp = deltaY < 0
      const canSwipeDown = movingDown && atTop && allowDown
      const canSwipeUp = movingUp && atBottom && allowUp
      return canSwipeDown || canSwipeUp
    }

    const useHorizontalAxis =
      hasHorizontal && deltaX !== 0 && (!hasVertical || absDeltaX > absDeltaY)
    if (useHorizontalAxis) {
      const maxScrollLeft = Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth)
      const atLeft = scrollTarget.scrollLeft <= 0
      const atRight = scrollTarget.scrollLeft >= maxScrollLeft
      const movingRight = deltaX > 0
      const movingLeft = deltaX < 0
      const canSwipeRight = movingRight && atLeft && allowRight
      const canSwipeLeft = movingLeft && atRight && allowLeft
      return canSwipeRight || canSwipeLeft
    }

    return null
  }

  start = (event: PointerEvent | TouchEvent) => {
    if (!this.#enabled) return
    if (event.defaultPrevented) return

    if (!('touches' in event) && event.button !== 0) return

    const startPos = getPrimaryPointerPosition(event)
    if (!startPos) return

    this.#pendingSwipeStartPos = startPos
    this.#swipeFromScrollable = false
    this.#sawPrimaryButtonsOnMove = !('touches' in event)

    const canStart = this.#options().canStart
    if (
      canStart &&
      !canStart(startPos, {
        nativeEvent: event,
        direction: this.#directionsState.primaryDirection
      })
    ) {
      return
    }

    if (this.#startSwipeAtPosition(event, startPos)) {
      this.#pendingSwipeStartPos = null
    }
  }

  #updateCancelBaseline(position: { x: number; y: number }, movement: { x: number; y: number }) {
    const baseline = this.#swipeCancelBaseline
    const reversedX =
      (movement.x < 0 && position.x > baseline.x) || (movement.x > 0 && position.x < baseline.x)
    const reversedY =
      (movement.y < 0 && position.y > baseline.y) || (movement.y > 0 && position.y < baseline.y)

    this.#swipeCancelBaseline = {
      x: reversedX ? position.x : baseline.x,
      y: reversedY ? position.y : baseline.y
    }
  }

  #lockAxisOnFirstRealSwipe(deltaX: number, deltaY: number) {
    if (this.#isRealSwipe || Math.hypot(deltaX, deltaY) < MIN_DRAG_THRESHOLD) return

    this.#isRealSwipe = true

    const { hasHorizontal, hasVertical } = this.#directionsState
    if (hasHorizontal && hasVertical) {
      this.#lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
    }
  }

  #adoptIntendedDirection(
    lockedAxis: 'horizontal' | 'vertical' | null,
    deltaX: number,
    deltaY: number
  ) {
    const { allowLeft, allowRight, allowUp, allowDown } = this.#directionsState

    let candidate: SwipeDirection | undefined
    if (lockedAxis === 'vertical') {
      if (deltaY !== 0) candidate = deltaY > 0 ? 'down' : 'up'
    } else if (lockedAxis === 'horizontal') {
      if (deltaX !== 0) candidate = deltaX > 0 ? 'right' : 'left'
    } else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      candidate = deltaX > 0 ? 'right' : 'left'
    } else {
      candidate = deltaY > 0 ? 'down' : 'up'
    }

    if (!candidate) return

    const isAllowed =
      (candidate === 'left' && allowLeft) ||
      (candidate === 'right' && allowRight) ||
      (candidate === 'up' && allowUp) ||
      (candidate === 'down' && allowDown)
    if (!isAllowed) return

    this.#intendedSwipeDirection = candidate
    this.#maxSwipeDisplacement = getDisplacement(candidate, deltaX, deltaY)
    this.direction = candidate
    this.#resolveSwipeThreshold(candidate)
  }

  #updateReverseCancellation(cancelDeltaX: number, cancelDeltaY: number) {
    const { allowLeft, allowRight, allowUp, allowDown } = this.#directionsState
    const direction = this.#intendedSwipeDirection
    const displacement = getDisplacement(direction, cancelDeltaX, cancelDeltaY)

    if (displacement > this.#swipeThresholdValue) {
      this.#cancelledSwipe = false
      this.direction = direction
      return
    }

    if (
      !(allowLeft && allowRight) &&
      !(allowUp && allowDown) &&
      this.#maxSwipeDisplacement - displacement >= REVERSE_CANCEL_THRESHOLD
    ) {
      this.#cancelledSwipe = true
    }
  }

  #applyDragOffset(
    deltaX: number,
    deltaY: number,
    lockedAxis: 'horizontal' | 'vertical' | null
  ): { x: number; y: number } {
    const { hasHorizontal, hasVertical } = this.#directionsState
    const damped = this.#applyDirectionalDamping(deltaX, deltaY)
    const initialTransform = this.#initialTransform

    const offsetX = initialTransform.x + (hasHorizontal && lockedAxis !== 'vertical' ? damped.x : 0)
    const offsetY = initialTransform.y + (hasVertical && lockedAxis !== 'horizontal' ? damped.y : 0)

    this.#dragOffsetCurrent = { x: offsetX, y: offsetY }
    if (this.#trackDrag) {
      this.#dragOffset = { x: offsetX, y: offsetY }
    }

    return { x: offsetX, y: offsetY }
  }

  #computeSwipeProgress(offset: { x: number; y: number }): number {
    const direction = this.#directionsState.primaryDirection ?? this.#intendedSwipeDirection
    if (!direction) return 0

    const size =
      direction === 'left' || direction === 'right'
        ? this.#elementSize.width
        : this.#elementSize.height
    const scale = this.#initialTransform.scale || 1
    if (size <= 0 || scale <= 0) return 0

    const displacement = getDisplacement(
      direction,
      offset.x - this.#initialTransform.x,
      offset.y - this.#initialTransform.y
    )
    return displacement > 0 ? displacement / (size * scale) : 0
  }

  #moveCore(
    event: PointerEvent | TouchEvent,
    boundaryElement: HTMLElement,
    position: { x: number; y: number },
    movement: { x: number; y: number }
  ) {
    if (!this.#enabled || !this.#swipingUntracked) return

    if (isTouchLikeEvent(event) && !this.#swipeFromScrollable) {
      const target = getTarget(event)
      if (this.#findGestureScrollableTouchTarget(target, boundaryElement)) {
        return
      }
    }

    if (!('touches' in event)) {
      // Prevent text selection on Safari
      event.preventDefault()
    }

    if (this.#isFirstPointerMove) {
      this.#isFirstPointerMove = false
      // Accounts for the delay between pointerdown and the first pointermove on iOS.
      if (this.#trackDrag) {
        this.#dragStartPos = position
        const moveTime = getValidTimeStamp(event.timeStamp)
        if (moveTime !== null) {
          this.#swipeStartTime = moveTime
        }
      }
    }

    this.#updateCancelBaseline(position, movement)

    const deltaX = position.x - this.#dragStartPos.x
    const deltaY = position.y - this.#dragStartPos.y

    this.#lockAxisOnFirstRealSwipe(deltaX, deltaY)
    const lockedAxis = this.#lockedAxis

    if (this.#intendedSwipeDirection) {
      this.#updateReverseCancellation(
        position.x - this.#swipeCancelBaseline.x,
        position.y - this.#swipeCancelBaseline.y
      )
    } else {
      this.#adoptIntendedDirection(lockedAxis, deltaX, deltaY)
    }

    const offset = this.#applyDragOffset(deltaX, deltaY, lockedAxis)
    this.#recordDragSample(offset, getValidTimeStamp(event.timeStamp))
    this.#updateSwipeProgress(this.#computeSwipeProgress(offset), {
      deltaX: offset.x - this.#initialTransform.x,
      deltaY: offset.y - this.#initialTransform.y,
      direction: this.#intendedSwipeDirection
    })
  }

  #startPendingSwipe(
    event: PointerEvent | TouchEvent,
    position: { x: number; y: number }
  ): boolean {
    if (!isTouchLikeEvent(event) && event.defaultPrevented) {
      this.#resetPendingSwipeState()
      return true
    }

    const canStart = this.#options().canStart
    if (
      canStart &&
      !canStart(position, {
        nativeEvent: event,
        direction: this.#directionsState.primaryDirection
      })
    ) {
      return false
    }

    const pendingStartPos = this.#pendingSwipeStartPos
    const element = this.#element
    let ignoreScrollableOnStart = false

    if (isTouchLikeEvent(event) && pendingStartPos && element) {
      const target = this.#getTargetAtPoint(position, event)
      const body = ownerDocumentOf(element).body
      const scrollTarget = body ? this.#findGestureScrollableTouchTarget(target, body) : null

      if (scrollTarget && (contains(element, scrollTarget) || contains(scrollTarget, element))) {
        const canSwipeFromEdge = this.#canSwipeFromScrollEdgeOnPendingMove(
          scrollTarget,
          position.x - pendingStartPos.x,
          position.y - pendingStartPos.y
        )

        if (canSwipeFromEdge === false) return true
        if (canSwipeFromEdge === true) ignoreScrollableOnStart = true
      }
    }

    const started = this.#startSwipeAtPosition(event, position, ignoreScrollableOnStart)
    if (!started) return false

    this.#pendingSwipeStartPos = null

    if (pendingStartPos && ignoreScrollableOnStart) {
      this.#dragStartPos = pendingStartPos
      this.#swipeCancelBaseline = pendingStartPos
      this.#lastMovePos = pendingStartPos
      this.#isFirstPointerMove = false
    } else {
      this.#swipeFromScrollable = false
    }

    return false
  }

  move = (event: PointerEvent | TouchEvent, boundaryElement: HTMLElement) => {
    if (!this.#enabled) return

    const currentPos = getPrimaryPointerPosition(event)
    if (!currentPos) return

    let endAfterMove = false

    if (!('touches' in event)) {
      const hasPrimary = hasPrimaryMouseButton(event.buttons)
      if (hasPrimary) {
        this.#sawPrimaryButtonsOnMove = true
      }

      if (event.buttons !== 0 && !hasPrimary) {
        this.#cancelSwipeInteraction(event)
        return
      }

      if (event.buttons === 0 && this.#sawPrimaryButtonsOnMove) {
        if (!this.#swipingUntracked) {
          this.end(event)
          return
        }
        endAfterMove = true
      }
    }

    if (
      !this.swiping &&
      this.#pendingSwipeStartPos !== null &&
      this.#startPendingSwipe(event, currentPos)
    ) {
      return
    }

    const previousPos = this.#lastMovePos
    const movement =
      previousPos === null
        ? { x: 0, y: 0 }
        : { x: currentPos.x - previousPos.x, y: currentPos.y - previousPos.y }

    this.#lastMovePos = currentPos
    this.#moveCore(event, boundaryElement, currentPos, movement)

    // The `'touches'` guard re-narrows the event type for `end`.
    if (endAfterMove && !('touches' in event)) {
      this.end(event)
    }
  }

  end = (event: PointerEvent | TouchEvent) => {
    if (!this.#enabled) return

    const { primaryDirection } = this.#directionsState

    const dragOffset = this.#dragOffsetCurrent
    const initialTransform = this.#initialTransform
    const releaseDeltaX = dragOffset.x - initialTransform.x
    const releaseDeltaY = dragOffset.y - initialTransform.y
    const progressDetails: SwipeDismissProgressDetails = {
      deltaX: releaseDeltaX,
      deltaY: releaseDeltaY,
      direction: this.direction ?? this.#intendedSwipeDirection
    }
    const snapBack = () => {
      this.#dragOffsetCurrent = { x: initialTransform.x, y: initialTransform.y }
      this.#dragOffset = { x: initialTransform.x, y: initialTransform.y }
      this.direction = undefined
      this.#updateSwipeProgress(0, progressDetails)
    }

    if (!this.#swipingUntracked) {
      this.#resetPendingSwipeState()
      this.#updateSwipeProgress(0, progressDetails)
      return
    }

    this.#setSwiping(false)
    this.#isRealSwipe = false
    this.#lockedAxis = null
    this.#resetPendingSwipeState()
    this.#sawPrimaryButtonsOnMove = false

    const element = this.#element
    if (element && !('touches' in event)) {
      safelyChangePointerCapture(element, event.pointerId, 'releasePointerCapture')
    }

    const releaseDecision = this.#options().onRelease?.({
      event,
      direction: this.direction ?? this.#intendedSwipeDirection,
      deltaX: releaseDeltaX,
      deltaY: releaseDeltaY,
      ...this.#resolveVelocities(
        releaseDeltaX,
        releaseDeltaY,
        dragOffset,
        getValidTimeStamp(event.timeStamp)
      )
    })
    const hasReleaseDecision = typeof releaseDecision === 'boolean'

    const cancelled = this.#cancelledSwipe || event.type === 'pointercancel'

    if (cancelled && !hasReleaseDecision) {
      snapBack()
      return
    }

    const dismissDirection = hasReleaseDecision
      ? releaseDecision
        ? (this.direction ?? this.#intendedSwipeDirection ?? primaryDirection)
        : undefined
      : this.#findDismissedDirection(releaseDeltaX, releaseDeltaY)

    if (!dismissDirection) {
      snapBack()
      return
    }

    this.direction = dismissDirection
    this.#options().onDismiss?.(event, { direction: dismissDirection })
  }

  #resolveVelocities(
    deltaX: number,
    deltaY: number,
    dragOffset: { x: number; y: number },
    endTime: number | null
  ) {
    const startTime = this.#swipeStartTime
    const durationMs =
      startTime !== null && endTime !== null && endTime > startTime ? endTime - startTime : 0
    const velocityDurationMs = durationMs > 0 ? Math.max(durationMs, MIN_VELOCITY_DURATION_MS) : 0

    let releaseVelocityX = this.#lastDragVelocity.x
    let releaseVelocityY = this.#lastDragVelocity.y

    const lastSample = this.#lastDragSample
    if (lastSample && endTime !== null && endTime >= lastSample.time) {
      const ageMs = endTime - lastSample.time
      if (ageMs > MAX_RELEASE_VELOCITY_AGE_MS) {
        releaseVelocityX = 0
        releaseVelocityY = 0
      } else {
        const sampleDurationMs = Math.max(ageMs, MIN_RELEASE_VELOCITY_DURATION_MS)
        const sampleVelocityX = (dragOffset.x - lastSample.x) / sampleDurationMs
        const sampleVelocityY = (dragOffset.y - lastSample.y) / sampleDurationMs
        if (sampleVelocityX !== 0) releaseVelocityX = sampleVelocityX
        if (sampleVelocityY !== 0) releaseVelocityY = sampleVelocityY
      }
    }

    return {
      velocityX: velocityDurationMs > 0 ? deltaX / velocityDurationMs : 0,
      velocityY: velocityDurationMs > 0 ? deltaY / velocityDurationMs : 0,
      releaseVelocityX,
      releaseVelocityY
    }
  }

  #findDismissedDirection(deltaX: number, deltaY: number): SwipeDirection | undefined {
    const threshold = this.#swipeThresholdValue
    return this.#directions.find(
      (direction) => getDisplacement(direction, deltaX, deltaY) > threshold
    )
  }
}
