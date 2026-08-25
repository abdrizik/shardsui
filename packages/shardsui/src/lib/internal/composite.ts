import type { CompositeOrientation } from './floating/composite.svelte'

export const COMPOSITE_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End'
])

export type ModifierKey = 'Shift' | 'Control' | 'Alt' | 'Meta'

function getOffset(ancestor: HTMLElement, element: HTMLElement, side: 'left' | 'top') {
  const propName = side === 'left' ? 'offsetLeft' : 'offsetTop'
  let result = 0
  let node = element

  while (node.offsetParent) {
    result += node[propName]
    if (node.offsetParent === ancestor) break
    if (!(node.offsetParent instanceof HTMLElement)) break
    node = node.offsetParent
  }

  return result
}

function getStyles(element: HTMLElement) {
  const styles = getComputedStyle(element)
  return {
    scrollMarginTop: parseFloat(styles.scrollMarginTop) || 0,
    scrollMarginRight: parseFloat(styles.scrollMarginRight) || 0,
    scrollMarginBottom: parseFloat(styles.scrollMarginBottom) || 0,
    scrollMarginLeft: parseFloat(styles.scrollMarginLeft) || 0,
    scrollPaddingTop: parseFloat(styles.scrollPaddingTop) || 0,
    scrollPaddingRight: parseFloat(styles.scrollPaddingRight) || 0,
    scrollPaddingBottom: parseFloat(styles.scrollPaddingBottom) || 0,
    scrollPaddingLeft: parseFloat(styles.scrollPaddingLeft) || 0
  }
}

export function scrollIntoViewIfNeeded(
  scrollContainer: HTMLElement | null,
  element: HTMLElement | null,
  direction: 'ltr' | 'rtl',
  orientation: CompositeOrientation
) {
  if (!scrollContainer || !element || !scrollContainer.scrollTo) return

  let targetX = scrollContainer.scrollLeft
  let targetY = scrollContainer.scrollTop

  const isOverflowingX = scrollContainer.clientWidth < scrollContainer.scrollWidth
  const isOverflowingY = scrollContainer.clientHeight < scrollContainer.scrollHeight

  if (isOverflowingX && orientation !== 'vertical') {
    const elementOffsetLeft = getOffset(scrollContainer, element, 'left')
    const containerStyles = getStyles(scrollContainer)
    const elementStyles = getStyles(element)

    const rightEdgeOverflows =
      elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight >
      scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight
    const leftEdgeOverflows =
      elementOffsetLeft - elementStyles.scrollMarginLeft <
      scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft

    const alignedRight =
      elementOffsetLeft +
      element.offsetWidth +
      elementStyles.scrollMarginRight -
      scrollContainer.clientWidth +
      containerStyles.scrollPaddingRight
    const alignedLeft =
      elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft

    if (direction === 'ltr') {
      if (rightEdgeOverflows) {
        targetX = alignedRight
      } else if (leftEdgeOverflows) {
        targetX = alignedLeft
      }
    } else if (leftEdgeOverflows) {
      targetX = alignedLeft
    } else if (rightEdgeOverflows) {
      targetX = alignedRight
    }
  }

  if (isOverflowingY && orientation !== 'horizontal') {
    const elementOffsetTop = getOffset(scrollContainer, element, 'top')
    const containerStyles = getStyles(scrollContainer)
    const elementStyles = getStyles(element)

    if (
      elementOffsetTop - elementStyles.scrollMarginTop <
      scrollContainer.scrollTop + containerStyles.scrollPaddingTop
    ) {
      targetY = elementOffsetTop - elementStyles.scrollMarginTop - containerStyles.scrollPaddingTop
    } else if (
      elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom >
      scrollContainer.scrollTop + scrollContainer.clientHeight - containerStyles.scrollPaddingBottom
    ) {
      targetY =
        elementOffsetTop +
        element.offsetHeight +
        elementStyles.scrollMarginBottom -
        scrollContainer.clientHeight +
        containerStyles.scrollPaddingBottom
    }
  }

  scrollContainer.scrollTo({ left: targetX, top: targetY, behavior: 'auto' })
}
