import type { DialogRoot } from '$lib/components/dialog/dialog.svelte'
import { clamp } from '$lib/internal/clamp'
import { isVirtualClick } from '$lib/internal/floating/event'
import { REASONS } from '$lib/internal/reasons'
import {
  getDisplacement,
  getElementTransform,
  SwipeDismiss
} from '$lib/internal/swipe-dismiss.svelte'
import { on } from 'svelte/events'
import { DRAWER_SWIPE_MOVEMENT_X_VAR, DRAWER_SWIPE_MOVEMENT_Y_VAR } from './constants'
import type { DrawerProviderContext } from './context'
import type { DrawerRoot, DrawerSwipeDirection } from './drawer.svelte'
import {
  resetBackdropSwipeVars,
  setBackdropSwipeVars,
  setBackdropSwipingAttribute
} from './swipe-dom'

const DEFAULT_SWIPE_OPEN_RATIO = 0.5
const MIN_SWIPE_START_DISTANCE = 1
const VELOCITY_THRESHOLD = 0.1
const FALLBACK_SWIPE_OPEN_THRESHOLD = 40

const oppositeSwipeDirection: Record<DrawerSwipeDirection, DrawerSwipeDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}

type DrawerSwipeAreaOptions = {
  ref: HTMLElement | null
  id: string
  disabled: boolean
  swipeDirection: DrawerSwipeDirection | undefined
}

/** Swipe-from-edge opening for `DrawerSwipeArea`. */
export class DrawerSwipeArea {
  #dialog: DialogRoot
  #drawer: DrawerRoot
  #provider: DrawerProviderContext | undefined
  #options: () => DrawerSwipeAreaOptions

  #swipeActive = $state(false)
  #openedBySwipe = false
  #closedOffset: number | null = null
  #appliedSwipeStyles = $state(false)
  #popupTransition: string | null = null
  #dragDelta = { x: 0, y: 0 }
  #swipePopupElement: HTMLElement | null = null
  #swipeBackdropElement: HTMLElement | null = null

  #releaseGuardCleanup: (() => void) | null = null
  #swipe: SwipeDismiss

  swipeDirection = $derived.by(
    () => this.#options().swipeDirection ?? oppositeSwipeDirection[this.#drawer.swipeDirection]
  )

  enabled = $derived.by(
    () => !this.#options().disabled && (!this.#dialog.open || this.#swipeActive)
  )

  touchAction = $derived.by(() =>
    this.swipeDirection === 'left' || this.swipeDirection === 'right' ? 'pan-y' : 'pan-x'
  )

  get swiping(): boolean {
    return this.#swipe.swiping
  }

  #dismissDirection = $derived(oppositeSwipeDirection[this.swipeDirection])

  #dismissHorizontal = $derived(
    this.#dismissDirection === 'left' || this.#dismissDirection === 'right'
  )

  constructor(
    dialog: DialogRoot,
    drawer: DrawerRoot,
    provider: DrawerProviderContext | undefined,
    options: () => DrawerSwipeAreaOptions
  ) {
    this.#dialog = dialog
    this.#drawer = drawer
    this.#provider = provider
    this.#options = options

    this.#swipe = new SwipeDismiss(() => ({
      enabled: this.enabled,
      directions: [this.swipeDirection],
      element: this.#options().ref,
      trackDrag: false,
      movementCssVars: {
        x: DRAWER_SWIPE_MOVEMENT_X_VAR,
        y: DRAWER_SWIPE_MOVEMENT_Y_VAR
      },
      onSwipeStart: () => {
        this.#disableDismissForSwipe()
        this.#openedBySwipe = false
        this.#swipeActive = true
        this.#resetDragDelta()
      },
      onProgress: this.#applySwipeProgress,
      onRelease: this.#settleSwipeRelease,
      onCancel: () => this.#finishSwipeInteraction()
    }))

    $effect(() => () => {
      this.#releaseGuardCleanup?.()
      this.#dialog.outsidePressEnabled = true
    })

    $effect(() => {
      if (this.#swipeActive && this.#appliedSwipeStyles) this.#applySwipeMovement()
    })

    $effect(() => {
      const element = this.#options().ref
      if (!element) return
      return this.#dialog.registerTrigger(this.#options().id, element)
    })

    $effect(() => {
      if (!this.enabled) {
        if (this.#swipeActive) this.#enableDismissAfterRelease()
        this.#swipe.reset()
        this.#resetDragDelta()
        this.#clearSwipeStyles()
        this.#resetSwipeInteractionState()
      }
    })
  }

  attach = (node: HTMLElement): (() => void) => {
    const cleanups = [
      on(node, 'pointerdown', this.#onpointerdown),
      on(node, 'pointermove', (event) => {
        if (event.pointerType === 'touch') return
        this.#swipe.move(event, node)
      }),
      on(node, 'pointerup', this.#endPointerSwipe),
      on(node, 'pointercancel', this.#endPointerSwipe),
      on(node, 'touchstart', this.#swipe.start),
      on(node, 'touchmove', (event) => this.#swipe.move(event, node)),
      on(node, 'touchend', this.#swipe.end),
      on(node, 'touchcancel', this.#swipe.end)
    ]
    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }

  #resetDragDelta(): void {
    this.#dragDelta = { x: 0, y: 0 }
  }

  #disableDismissForSwipe(): void {
    this.#releaseGuardCleanup?.()
    this.#dialog.outsidePressEnabled = false
  }

  #enableDismissAfterRelease(): void {
    this.#releaseGuardCleanup?.()

    const doc = this.#options().ref?.ownerDocument ?? document

    const restore = (event?: MouseEvent) => {
      if (event?.type === 'click' && event.detail !== 0 && !isVirtualClick(event)) return

      this.#releaseGuardCleanup = null
      offPointerdown()
      offClick()
      this.#dialog.outsidePressEnabled = true
    }

    const offPointerdown = on(doc, 'pointerdown', restore, { capture: true })
    const offClick = on(doc, 'click', restore, { capture: true })
    this.#releaseGuardCleanup = restore
  }

  #popupSize(): number | null {
    const popupElement = this.#dialog.popupElement
    if (!popupElement) return null

    const size = this.#dismissHorizontal ? popupElement.offsetWidth : popupElement.offsetHeight
    return size > 0 ? size : null
  }

  #measureClosedOffset(popupElement: HTMLElement): number | null {
    const size = this.#popupSize()
    if (size == null) return null

    const transform = getElementTransform(popupElement)
    const transformOffset = this.#dismissHorizontal ? transform.x : transform.y
    return Math.abs(transformOffset) > 0.5 ? Math.min(size, Math.abs(transformOffset)) : size
  }

  #swipeOpenThreshold(): number {
    const popupSize = this.#popupSize()
    return popupSize == null ? FALLBACK_SWIPE_OPEN_THRESHOLD : popupSize * DEFAULT_SWIPE_OPEN_RATIO
  }

  #applySwipeMovement(): void {
    const dialog = this.#dialog
    const popupElement = dialog.popupElement
    if (!popupElement) return

    if (!dialog.open || !dialog.mounted) return

    this.#closedOffset ??= this.#measureClosedOffset(popupElement)
    const closedOffset = this.#closedOffset
    if (closedOffset === null) return

    const { x: deltaX, y: deltaY } = this.#dragDelta
    const displacement = Math.max(0, getDisplacement(this.swipeDirection, deltaX, deltaY))
    const dampedDisplacement =
      displacement > closedOffset
        ? closedOffset + Math.sqrt(displacement - closedOffset)
        : displacement
    const remaining = closedOffset - dampedDisplacement
    const dismissDirection = this.#dismissDirection
    const movement =
      dismissDirection === 'left' || dismissDirection === 'up' ? -remaining : remaining
    const movementX = this.#dismissHorizontal ? movement : 0
    const movementY = this.#dismissHorizontal ? 0 : movement
    const openProgress = clamp(displacement / closedOffset, 0, 1)

    popupElement.style.setProperty(DRAWER_SWIPE_MOVEMENT_X_VAR, `${movementX}px`)
    popupElement.style.setProperty(DRAWER_SWIPE_MOVEMENT_Y_VAR, `${movementY}px`)
    this.#swipePopupElement = popupElement
    this.#popupTransition ??= popupElement.style.transition
    popupElement.style.transition = 'none'

    const frontmostHeight = this.#drawer.frontmostHeight
    const backdropElement = dialog.backdropElement
    if (backdropElement) {
      const backdropProgress = clamp(1 - openProgress, 0, 1)
      setBackdropSwipingAttribute(backdropElement, true)
      this.#swipeBackdropElement = backdropElement
      setBackdropSwipeVars(
        backdropElement,
        backdropProgress,
        openProgress > 0 ? frontmostHeight : 0
      )
    }

    this.#provider?.setVisualState({
      swipeProgress: openProgress,
      frontmostHeight: openProgress > 0 ? frontmostHeight : 0
    })

    this.#appliedSwipeStyles = true
    this.#drawer.swipeAreaActive = true
  }

  #clearSwipeStyles(): void {
    const popupElement = this.#swipePopupElement
    if (popupElement) {
      popupElement.style.removeProperty(DRAWER_SWIPE_MOVEMENT_X_VAR)
      popupElement.style.removeProperty(DRAWER_SWIPE_MOVEMENT_Y_VAR)
    }

    if (popupElement && this.#popupTransition !== null) {
      popupElement.style.transition = this.#popupTransition
      this.#popupTransition = null
    }

    const backdropElement = this.#swipeBackdropElement
    if (backdropElement) {
      setBackdropSwipingAttribute(backdropElement, false)
      resetBackdropSwipeVars(backdropElement)
    }

    this.#provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 })

    this.#appliedSwipeStyles = false
    this.#swipePopupElement = null
    this.#swipeBackdropElement = null
    this.#drawer.swipeAreaActive = false
  }

  #openDrawer(): void {
    if (this.#dialog.open) return
    this.#openedBySwipe = true
    this.#dialog.setOpen(true, REASONS.swipe)
  }

  #resetSwipeInteractionState(): void {
    this.#openedBySwipe = false
    this.#closedOffset = null
    this.#swipeActive = false
  }

  #finishSwipeInteraction(): void {
    this.#resetSwipeInteractionState()
    this.#enableDismissAfterRelease()
    this.#resetDragDelta()
    this.#clearSwipeStyles()
  }

  #applySwipeProgress = (
    _progress: number,
    details?: { direction?: DrawerSwipeDirection; deltaX: number; deltaY: number }
  ): void => {
    if (!details) return
    if (!this.#swipeActive) return

    this.#dragDelta = { x: details.deltaX, y: details.deltaY }

    if (details.direction !== this.swipeDirection) return

    const displacement = getDisplacement(this.swipeDirection, details.deltaX, details.deltaY)

    if (!this.#openedBySwipe) {
      if (displacement < MIN_SWIPE_START_DISTANCE) return
      this.#openDrawer()
    }

    this.#applySwipeMovement()
  }

  #settleSwipeRelease = ({
    direction,
    deltaX,
    deltaY,
    releaseVelocityX,
    releaseVelocityY
  }: {
    direction?: DrawerSwipeDirection
    deltaX: number
    deltaY: number
    releaseVelocityX: number
    releaseVelocityY: number
  }): boolean => {
    const displacement = getDisplacement(this.swipeDirection, deltaX, deltaY)
    const releaseVelocity = getDisplacement(this.swipeDirection, releaseVelocityX, releaseVelocityY)
    const threshold = this.#swipeOpenThreshold()
    const hasEnoughDistance = displacement >= threshold
    const hasEnoughVelocity = releaseVelocity >= VELOCITY_THRESHOLD
    const shouldOpen =
      direction === this.swipeDirection &&
      (hasEnoughDistance || hasEnoughVelocity) &&
      !this.#options().disabled

    if (shouldOpen) {
      this.#openDrawer()
    } else if (this.#openedBySwipe && this.#dialog.open) {
      this.#dialog.setOpen(false, REASONS.swipe)
    }

    this.#finishSwipeInteraction()
    return false
  }

  #onpointerdown = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    this.#swipe.start(event)

    if (event.cancelable) event.preventDefault()
  }

  #endPointerSwipe = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    this.#swipe.end(event)
  }
}
