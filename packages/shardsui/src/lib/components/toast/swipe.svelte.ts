import { SHARDSUI_SWIPE_IGNORE_SELECTOR } from '$lib/internal/constants'
import { getTarget } from '$lib/internal/dom'
import {
  getDisplacement,
  getElementTransform,
  safelyChangePointerCapture,
  type SwipeDirection
} from '$lib/internal/swipe-dismiss.svelte'

const SWIPE_THRESHOLD = 40
const REVERSE_CANCEL_THRESHOLD = 10
const OPPOSITE_DIRECTION_DAMPING_FACTOR = 0.5
const MIN_DRAG_THRESHOLD = 1
const IGNORE_SELECTOR = `button,a,input,textarea,[role="button"],${SHARDSUI_SWIPE_IGNORE_SELECTOR}`

type ToastSwipeOptions = {
  directions: SwipeDirection[]
  element: HTMLElement | null
  onSwipeStart: () => void
  onDismiss: () => void
}

function damp(delta: number): number {
  return delta > 0
    ? delta ** OPPOSITE_DIRECTION_DAMPING_FACTOR
    : -(Math.abs(delta) ** OPPOSITE_DIRECTION_DAMPING_FACTOR)
}

export class ToastSwipe {
  swiping = $state(false)
  direction = $state<SwipeDirection | undefined>(undefined)

  #dragOffset = $state.raw({ x: 0, y: 0 })
  #initialTransform = $state.raw({ x: 0, y: 0, scale: 1 })

  #isRealSwipe = false
  #lockedAxis: 'horizontal' | 'vertical' | null = null
  #dragStartPos = { x: 0, y: 0 }
  #cancelBaseline = { x: 0, y: 0 }
  #intendedDirection: SwipeDirection | undefined
  #maxDisplacement = 0
  #cancelled = false
  #isFirstPointerMove = false
  #activePointerId: number | null = null

  #options: () => ToastSwipeOptions

  constructor(options: () => ToastSwipeOptions) {
    this.#options = options
  }

  #directions = $derived.by(() => this.#options().directions)

  dragStyles = $derived({
    transition: this.swiping ? 'none' : undefined,
    transform: this.swiping
      ? `translateX(${this.#dragOffset.x}px) translateY(${this.#dragOffset.y}px) scale(${this.#initialTransform.scale})`
      : undefined,
    movementX: `${this.#dragOffset.x - this.#initialTransform.x}px`,
    movementY: `${this.#dragOffset.y - this.#initialTransform.y}px`
  })

  reset = () => {
    this.direction = undefined
    this.#initialTransform = { x: 0, y: 0, scale: 1 }
    this.#dragOffset = { x: 0, y: 0 }
  }

  start = (event: PointerEvent) => {
    const target = getTarget(event) as HTMLElement | null
    if (target?.closest(IGNORE_SELECTOR)) return

    this.#cancelled = false
    this.#intendedDirection = undefined
    this.#maxDisplacement = 0
    this.#activePointerId = event.pointerId
    this.#dragStartPos = { x: event.clientX, y: event.clientY }
    this.#cancelBaseline = this.#dragStartPos

    const element = this.#options().element
    if (element) {
      const transform = getElementTransform(element)
      this.#initialTransform = transform
      this.#dragOffset = { x: transform.x, y: transform.y }
      safelyChangePointerCapture(element, event.pointerId, 'setPointerCapture')
    }

    this.#options().onSwipeStart()

    this.swiping = true
    this.#isRealSwipe = false
    this.#lockedAxis = null
    this.#isFirstPointerMove = true
  }

  move = (event: PointerEvent) => {
    if (event.pointerId !== this.#activePointerId) return

    event.preventDefault()

    if (this.#isFirstPointerMove) {
      this.#dragStartPos = { x: event.clientX, y: event.clientY }
      this.#isFirstPointerMove = false
    }

    const { clientX, clientY, movementX, movementY } = event
    const baseline = this.#cancelBaseline

    if ((movementY < 0 && clientY > baseline.y) || (movementY > 0 && clientY < baseline.y)) {
      this.#cancelBaseline = { x: this.#cancelBaseline.x, y: clientY }
    }

    if ((movementX < 0 && clientX > baseline.x) || (movementX > 0 && clientX < baseline.x)) {
      this.#cancelBaseline = { x: clientX, y: this.#cancelBaseline.y }
    }

    const deltaX = clientX - this.#dragStartPos.x
    const deltaY = clientY - this.#dragStartPos.y
    const cancelDeltaX = clientX - this.#cancelBaseline.x
    const cancelDeltaY = clientY - this.#cancelBaseline.y

    const directions = this.#directions
    const allowLeft = directions.includes('left')
    const allowRight = directions.includes('right')
    const allowUp = directions.includes('up')
    const allowDown = directions.includes('down')
    const hasHorizontal = allowLeft || allowRight
    const hasVertical = allowUp || allowDown

    if (!this.#isRealSwipe && Math.hypot(deltaX, deltaY) >= MIN_DRAG_THRESHOLD) {
      this.#isRealSwipe = true
      if (hasHorizontal && hasVertical) {
        this.#lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
      }
    }

    const lockedAxis = this.#lockedAxis

    if (this.#intendedDirection) {
      const displacement = getDisplacement(this.#intendedDirection, cancelDeltaX, cancelDeltaY)

      if (displacement > SWIPE_THRESHOLD) {
        this.#cancelled = false
        this.direction = this.#intendedDirection
      } else if (
        !(allowLeft && allowRight) &&
        !(allowUp && allowDown) &&
        this.#maxDisplacement - displacement >= REVERSE_CANCEL_THRESHOLD
      ) {
        this.#cancelled = true
      }
    } else {
      let candidate: SwipeDirection | undefined
      if (lockedAxis === 'vertical') {
        if (deltaY > 0) candidate = 'down'
        else if (deltaY < 0) candidate = 'up'
      } else if (lockedAxis === 'horizontal') {
        if (deltaX > 0) candidate = 'right'
        else if (deltaX < 0) candidate = 'left'
      } else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        candidate = deltaX > 0 ? 'right' : 'left'
      } else {
        candidate = deltaY > 0 ? 'down' : 'up'
      }

      if (candidate && directions.includes(candidate)) {
        this.#intendedDirection = candidate
        this.#maxDisplacement = getDisplacement(candidate, deltaX, deltaY)
        this.direction = candidate
      }
    }

    const dampX = (deltaX > 0 && !allowRight) || (deltaX < 0 && !allowLeft)
    const dampY = (deltaY > 0 && !allowDown) || (deltaY < 0 && !allowUp)
    const initialTransform = this.#initialTransform

    this.#dragOffset = {
      x:
        initialTransform.x +
        (hasHorizontal && lockedAxis !== 'vertical' ? (dampX ? damp(deltaX) : deltaX) : 0),
      y:
        initialTransform.y +
        (hasVertical && lockedAxis !== 'horizontal' ? (dampY ? damp(deltaY) : deltaY) : 0)
    }
  }

  end = (event: PointerEvent) => {
    if (event.pointerId !== this.#activePointerId) return

    this.#activePointerId = null
    this.swiping = false
    this.#isRealSwipe = false
    this.#lockedAxis = null

    const initialTransform = this.#initialTransform
    const snapBack = () => {
      this.#dragOffset = { x: initialTransform.x, y: initialTransform.y }
      this.direction = undefined
    }

    if (event.type === 'pointercancel' || this.#cancelled) {
      snapBack()
      return
    }

    const deltaX = this.#dragOffset.x - initialTransform.x
    const deltaY = this.#dragOffset.y - initialTransform.y
    const dismissDirection = this.#directions.find(
      (direction) => getDisplacement(direction, deltaX, deltaY) > SWIPE_THRESHOLD
    )

    if (!dismissDirection) {
      snapBack()
      return
    }

    this.direction = dismissDirection
    this.#options().onDismiss()
  }
}
