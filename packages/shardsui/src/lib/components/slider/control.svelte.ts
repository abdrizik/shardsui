import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { clamp } from '$lib/internal/clamp'
import { DirectionContext } from '$lib/internal/direction-context'
import { contains, getTarget } from '$lib/internal/dom'
import { safelyChangePointerCapture } from '$lib/internal/swipe-dismiss.svelte'
import { isElement } from '@floating-ui/utils/dom'
import type { Attachment } from 'svelte/attachments'
import { on } from 'svelte/events'
import {
  getControlOffset,
  getMidpoint,
  resolveThumbCollision,
  roundValueToStep,
  validateMinimumDistance,
  type ResolveThumbCollisionResult
} from './math'
import type { SliderRoot } from './slider.svelte'

// Pointer moves a press must survive before it counts as a drag rather than jitter during a click.
const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2

type PressedThumb = { index: number; element: HTMLElement }

export function createSliderControl(slider: SliderRoot) {
  const direction = DirectionContext.get()

  let computedStyles: CSSStyleDeclaration | null = null

  let pressedThumbIndex = -1
  let pressedThumbCenterOffset = 0
  let pressedValues: readonly number[] | null = null
  let currentInteractionValue: number | number[] | null = null
  let latestValues: readonly number[] = []
  let touchId: number | null = null
  let insetThumbOffset = 0
  let moveCount = 0

  const focusFrame = new AnimationFrame()

  function fingerCoordsFromTouch(event: TouchEvent): { x: number; y: number } | null {
    if (touchId == null) return null
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      if (touch.identifier === touchId) {
        return { x: touch.clientX, y: touch.clientY }
      }
    }
    return null
  }

  function thumbContaining(target: EventTarget | null): PressedThumb | null {
    if (!isElement(target)) return null
    const index = slider.thumbElements.findIndex((element) => contains(element, target))
    return index === -1 ? null : { index, element: slider.thumbElements[index] }
  }

  function measureValueAtFinger(control: HTMLElement, fingerX: number, fingerY: number): number {
    const vertical = slider.orientation === 'vertical'
    const { width, height, bottom, left, right } = control.getBoundingClientRect()
    const controlOffset = getControlOffset(computedStyles, vertical)
    const controlSize =
      (vertical ? height : width) - controlOffset.start - controlOffset.end - insetThumbOffset * 2
    const adjustedX = fingerX - pressedThumbCenterOffset
    const adjustedY = fingerY - pressedThumbCenterOffset

    let distanceFromStart: number
    if (vertical) distanceFromStart = bottom - adjustedY - controlOffset.end
    else if (direction.direction === 'rtl')
      distanceFromStart = right - adjustedX - controlOffset.start
    else distanceFromStart = adjustedX - left - controlOffset.start

    const ratio = clamp((distanceFromStart - insetThumbOffset) / controlSize, 0, 1)

    const value = roundValueToStep(
      (slider.max - slider.min) * ratio + slider.min,
      slider.step,
      slider.min
    )
    return clamp(value, slider.min, slider.max)
  }

  function fingerState(fingerX: number, fingerY: number): ResolveThumbCollisionResult | null {
    const control = slider.controlElement
    if (!control || pressedThumbIndex < 0 || pressedThumbIndex >= slider.values.length) {
      if (pressedThumbIndex >= slider.values.length) {
        currentInteractionValue = null
      }
      return null
    }

    const nextValue = measureValueAtFinger(control, fingerX, fingerY)

    if (slider.values.length <= 1) {
      return { value: nextValue, thumbIndex: pressedThumbIndex, didSwap: false }
    }

    return resolveThumbCollision({
      behavior: slider.thumbCollisionBehavior,
      values: slider.values,
      currentValues: latestValues,
      initialValues: pressedValues,
      pressedIndex: pressedThumbIndex,
      nextValue,
      min: slider.min,
      max: slider.max,
      step: slider.step,
      minStepsBetweenValues: slider.minStepsBetweenValues
    })
  }

  function closestThumb(fingerX: number, fingerY: number): number {
    const vertical = slider.orientation === 'vertical'
    const coord = vertical ? fingerY : fingerX
    let minDistance: number | undefined
    let closestIndex = -1

    for (let i = 0; i < slider.thumbElements.length; i++) {
      if (slider.getThumbInput(i)?.disabled) continue

      const distance = Math.abs(coord - getMidpoint(slider.thumbElements[i], vertical))
      if (minDistance === undefined || distance <= minDistance) {
        closestIndex = i
        minDistance = distance
      }
    }

    return closestIndex
  }

  function focusThumb(index: number): void {
    slider.getThumbInput(index)?.focus({
      preventScroll: true,
      focusVisible: false
    })
  }

  function firstThumbAtMax(index: number): number {
    if (slider.values[index] !== slider.max) return index
    let candidate = index
    while (candidate > 0 && slider.values[candidate - 1] === slider.max) candidate -= 1
    return candidate
  }

  function measureInsetThumbOffset(thumbIndex: number): number {
    const thumbElement = slider.thumbElements[thumbIndex]
    if (!slider.inset || !thumbElement) return 0
    const thumbRect = thumbElement.getBoundingClientRect()
    return (slider.orientation === 'vertical' ? thumbRect.height : thumbRect.width) / 2
  }

  function setPressedThumb(index: number): void {
    pressedThumbIndex = index
    if (!slider.thumbElements[index]) pressedThumbCenterOffset = 0
  }

  function startPressing(fingerX: number, fingerY: number): void {
    pressedValues = slider.values.length > 1 ? slider.values : null
    currentInteractionValue = null
    latestValues = slider.values

    setPressedThumb(
      pressedThumbIndex > -1 && pressedThumbIndex < slider.values.length
        ? firstThumbAtMax(pressedThumbIndex)
        : closestThumb(fingerX, fingerY)
    )

    insetThumbOffset = measureInsetThumbOffset(pressedThumbIndex)
  }

  function applyFingerValue(finger: ResolveThumbCollisionResult): void {
    const applied = slider.setValue(finger.value)

    if (applied) {
      currentInteractionValue = finger.value
      latestValues = Array.isArray(finger.value) ? finger.value : [finger.value]

      if (finger.didSwap) {
        setPressedThumb(finger.thumbIndex)
        focusThumb(finger.thumbIndex)
      }
    }
  }

  function move(fingerX: number, fingerY: number): void {
    moveCount += 1

    const finger = fingerState(fingerX, fingerY)
    if (!finger) return

    if (validateMinimumDistance(finger.value, slider.step, slider.minStepsBetweenValues)) {
      if (!slider.dragging && moveCount > INTENTIONAL_DRAG_COUNT_THRESHOLD) {
        slider.dragging = true
      }
      applyFingerValue(finger)
    }
  }

  function onpointermove(event: PointerEvent): void {
    if (event.buttons === 0) {
      endDrag(event)
      return
    }
    move(event.clientX, event.clientY)
  }

  function ontouchmove(event: TouchEvent): void {
    const coords = fingerCoordsFromTouch(event)
    if (!coords) return
    move(coords.x, coords.y)
  }

  function endDrag(event: PointerEvent | TouchEvent): void {
    const control = slider.controlElement
    slider.setActive(-1)
    slider.dragging = false
    if (
      Array.isArray(currentInteractionValue) &&
      currentInteractionValue.length !== slider.values.length
    ) {
      currentInteractionValue = null
    }
    if (currentInteractionValue != null) {
      slider.commitValue(currentInteractionValue)
    }
    resetPressedThumb()

    if ('pointerId' in event && control?.hasPointerCapture(event.pointerId)) {
      control.releasePointerCapture(event.pointerId)
    }
    touchId = null
    stopListening()
  }

  function stopListening(): void {
    const doc = slider.controlElement?.ownerDocument ?? document
    doc.removeEventListener('pointermove', onpointermove)
    doc.removeEventListener('pointerup', endDrag)
    doc.removeEventListener('touchmove', ontouchmove)
    doc.removeEventListener('touchend', endDrag)
    pressedValues = null
    currentInteractionValue = null
  }

  function resetPressedThumb(): void {
    pressedThumbIndex = -1
    pressedThumbCenterOffset = 0
  }

  function setThumbCenterOffset(thumbElement: HTMLElement, x: number, y: number): void {
    const vertical = slider.orientation === 'vertical'
    pressedThumbCenterOffset = (vertical ? y : x) - getMidpoint(thumbElement, vertical)
  }

  function onpointerdown(event: PointerEvent): void {
    const control = slider.controlElement
    const target = getTarget(event)

    if (
      !control ||
      slider.disabled ||
      event.defaultPrevented ||
      !isElement(target) ||
      event.button !== 0
    ) {
      return
    }

    const pressedThumb = thumbContaining(target)

    if (pressedThumb && slider.getThumbInput(pressedThumb.index)?.disabled) {
      resetPressedThumb()
      return
    }

    if (pressedThumb) {
      pressedThumbIndex = pressedThumb.index
      setThumbCenterOffset(pressedThumb.element, event.clientX, event.clientY)
    }

    startPressing(event.clientX, event.clientY)

    const finger = fingerState(event.clientX, event.clientY)
    if (!finger) return

    const focusedThumb = slider.thumbElements[finger.thumbIndex]
    if (contains(focusedThumb, control.ownerDocument.activeElement)) {
      event.preventDefault()
    } else {
      focusFrame.request(() => focusThumb(finger.thumbIndex))
    }

    slider.dragging = true

    if (!pressedThumb) {
      applyFingerValue(finger)
    }

    if (event.pointerId) {
      safelyChangePointerCapture(control, event.pointerId, 'setPointerCapture')
    }

    moveCount = 0
    const doc = control.ownerDocument
    doc.addEventListener('pointermove', onpointermove, { passive: true })
    doc.addEventListener('pointerup', endDrag, { once: true })
  }

  function ontouchstart(event: TouchEvent): void {
    if (slider.disabled) return

    const touchedThumb = thumbContaining(getTarget(event))
    if (touchedThumb && slider.getThumbInput(touchedThumb.index)?.disabled) {
      resetPressedThumb()
      return
    }

    const touch = event.changedTouches[0]
    if (touch == null) return

    touchId = touch.identifier

    startPressing(touch.clientX, touch.clientY)

    const finger = fingerState(touch.clientX, touch.clientY)
    if (!finger) return

    focusThumb(finger.thumbIndex)
    applyFingerValue(finger)

    moveCount = 0
    const doc = slider.controlElement?.ownerDocument ?? document
    doc.addEventListener('touchmove', ontouchmove, { passive: true })
    doc.addEventListener('touchend', endDrag, { passive: true })
  }

  $effect(focusFrame.disposeEffect)

  $effect(() => stopListening)

  $effect(() => {
    if (slider.disabled) stopListening()
  })

  const listenTouchStart: Attachment<HTMLElement> = (node) =>
    on(node, 'touchstart', ontouchstart, { passive: true })

  const publishControlElement: Attachment<HTMLElement> = (node) => {
    computedStyles = (node.ownerDocument.defaultView ?? window).getComputedStyle(node)
    slider.controlElement = node

    return () => {
      slider.controlElement = null
      computedStyles = null
    }
  }

  return {
    publishControlElement,
    listenTouchStart,
    onpointerdown
  }
}
