import { contains } from '$lib/internal/dom'
import { isElement } from '@floating-ui/utils/dom'

import { SHARDSUI_SWIPE_IGNORE_SELECTOR } from '$lib/internal/constants'
import type { ScrollAxis } from '$lib/internal/scrollable'
import type { SwipeDirection } from '$lib/internal/swipe-dismiss.svelte'
import {
  DRAWER_CONTENT_SELECTOR,
  DRAWER_HEIGHT_VAR,
  DRAWER_SWIPE_PROGRESS_VAR,
  DRAWER_SWIPING_ATTR
} from './constants'

export const MIN_SWIPE_THRESHOLD = 10

const AXIS_LOCK_SLOP = 6
const AXIS_LOCK_BIAS = 2

export type TouchScroll = {
  startX: number
  startY: number
  lastX: number
  lastY: number
  scrollTarget: HTMLElement | null
  hasCrossAxisScrollableContent: boolean
  allowSwipe: boolean | null
  preserveNativeCrossAxisScroll: boolean
  drawerAxisAttributed: boolean
}

export function setBackdropSwipingAttribute(backdropElement: HTMLElement | null, swiping: boolean) {
  backdropElement?.toggleAttribute(DRAWER_SWIPING_ATTR, swiping)
}

export function setBackdropSwipeVars(
  backdropElement: HTMLElement,
  progress: number,
  height: number
) {
  backdropElement.style.setProperty(DRAWER_SWIPE_PROGRESS_VAR, `${progress}`)
  if (height > 0) {
    backdropElement.style.setProperty(DRAWER_HEIGHT_VAR, `${height}px`)
  } else {
    backdropElement.style.removeProperty(DRAWER_HEIGHT_VAR)
  }
}

export function resetBackdropSwipeVars(backdropElement: HTMLElement) {
  backdropElement.style.setProperty(DRAWER_SWIPE_PROGRESS_VAR, '0')
  backdropElement.style.removeProperty(DRAWER_HEIGHT_VAR)
}

export function isSwipeIgnoredTarget(target: Element | null): boolean {
  return Boolean(target?.closest(SHARDSUI_SWIPE_IGNORE_SELECTOR))
}

export function isDrawerContentTarget(target: Element | null): boolean {
  return Boolean(target?.closest(DRAWER_CONTENT_SELECTOR))
}

export function getBaseSwipeThreshold(element: HTMLElement, direction: SwipeDirection): number {
  const size =
    direction === 'left' || direction === 'right' ? element.offsetWidth : element.offsetHeight
  return Math.max(size * 0.5, MIN_SWIPE_THRESHOLD)
}

function isTextSelectionControl(
  target: EventTarget | null
): target is HTMLInputElement | HTMLTextAreaElement {
  if (!isElement(target)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
}

export function selectionEndpointElements(selection: Selection): [Element | null, Element | null] {
  return [
    isElement(selection.anchorNode)
      ? selection.anchorNode
      : (selection.anchorNode?.parentElement ?? null),
    isElement(selection.focusNode)
      ? selection.focusNode
      : (selection.focusNode?.parentElement ?? null)
  ]
}

function hasExpandedSelectionWithinTarget(selection: Selection, target: Element): boolean {
  const [anchorElement, focusElement] = selectionEndpointElements(selection)

  return (
    selection.containsNode(target, true) ||
    contains(target, anchorElement) ||
    contains(target, focusElement)
  )
}

export function shouldIgnoreSwipeForTextSelection(
  doc: Document,
  rootElement: HTMLElement
): boolean {
  const activeEl = doc.activeElement
  const activeElementWithinRoot = Boolean(activeEl && contains(rootElement, activeEl))

  if (activeElementWithinRoot && isTextSelectionControl(activeEl)) {
    const { selectionStart, selectionEnd } = activeEl
    if (selectionStart != null && selectionEnd != null && selectionStart < selectionEnd) {
      return true
    }
  }

  const selection = doc.getSelection()
  if (!selection || selection.isCollapsed) return false
  return hasExpandedSelectionWithinTarget(selection, rootElement)
}

export function updateTouchScrollPosition(state: TouchScroll, touch: Touch) {
  state.lastX = touch.clientX
  state.lastY = touch.clientY
}

export function shouldYieldTouchMove(
  state: TouchScroll,
  event: TouchEvent,
  touch: Touch,
  verticalAxis: boolean
): boolean {
  if (state.preserveNativeCrossAxisScroll) return true

  if (
    state.drawerAxisAttributed ||
    state.allowSwipe === true ||
    !state.hasCrossAxisScrollableContent
  ) {
    return false
  }

  if (!event.cancelable) {
    state.preserveNativeCrossAxisScroll = true
    return true
  }

  const drawerAxisGestureDelta = verticalAxis
    ? touch.clientY - state.startY
    : touch.clientX - state.startX
  const crossAxisGestureDelta = verticalAxis
    ? touch.clientX - state.startX
    : touch.clientY - state.startY
  const absDrawerAxisGestureDelta = Math.abs(drawerAxisGestureDelta)
  const absCrossAxisGestureDelta = Math.abs(crossAxisGestureDelta)

  if (
    absCrossAxisGestureDelta >= AXIS_LOCK_SLOP &&
    absCrossAxisGestureDelta > absDrawerAxisGestureDelta + AXIS_LOCK_BIAS
  ) {
    state.preserveNativeCrossAxisScroll = true
    return true
  }

  if (absDrawerAxisGestureDelta >= AXIS_LOCK_SLOP) {
    state.drawerAxisAttributed = true
    return false
  }

  return true
}

export function hasScrollableContentOnAxis(scrollTarget: HTMLElement, axis: ScrollAxis): boolean {
  return axis === 'vertical'
    ? scrollTarget.scrollHeight > scrollTarget.clientHeight
    : scrollTarget.scrollWidth > scrollTarget.clientWidth
}

function getScrollMetrics(scrollTarget: HTMLElement, axis: ScrollAxis) {
  if (axis === 'vertical') {
    const max = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight)
    return { offset: scrollTarget.scrollTop, max }
  }
  const max = Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth)
  return { offset: scrollTarget.scrollLeft, max }
}

function dismissesFromStartEdge(direction: SwipeDirection): boolean {
  return direction === 'down' || direction === 'right'
}

export function isAtSwipeStartEdge(
  scrollTarget: HTMLElement,
  axis: ScrollAxis,
  direction: SwipeDirection
): boolean {
  const { offset, max } = getScrollMetrics(scrollTarget, axis)
  return dismissesFromStartEdge(direction) ? offset <= 0 : offset >= max
}

export function canSwipeFromScrollEdgeOnMove(
  scrollTarget: HTMLElement,
  axis: ScrollAxis,
  direction: SwipeDirection,
  delta: number
): boolean {
  const { offset, max } = getScrollMetrics(scrollTarget, axis)
  const dismissFromStartEdge = dismissesFromStartEdge(direction)

  const movingTowardDismiss = dismissFromStartEdge ? delta > 0 : delta < 0
  if (!movingTowardDismiss) return false
  return dismissFromStartEdge ? offset <= 0 : offset >= max
}
