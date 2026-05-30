import {
  getComputedStyle,
  getParentNode,
  isHTMLElement,
  isLastTraversableNode
} from '@floating-ui/utils/dom'

export type ScrollAxis = 'horizontal' | 'vertical'

export function isScrollable(element: HTMLElement, axis: ScrollAxis): boolean {
  const vertical = axis === 'vertical'
  const { overflowX, overflowY } = getComputedStyle(element)
  const overflow = vertical ? overflowY : overflowX
  if (overflow !== 'auto' && overflow !== 'scroll') {
    return false
  }

  return vertical
    ? element.scrollHeight > element.clientHeight
    : element.scrollWidth > element.clientWidth
}

export function hasScrollableAncestor(
  target: HTMLElement,
  root: HTMLElement,
  axes: ScrollAxis[]
): boolean {
  let node: Node | null = target
  while (isHTMLElement(node) && node !== root && !isLastTraversableNode(node)) {
    for (const axis of axes) {
      if (isScrollable(node, axis)) return true
    }
    node = getParentNode(node)
  }
  return false
}

export function findScrollableTouchTarget(
  target: EventTarget | null,
  root: HTMLElement,
  axis: ScrollAxis
): HTMLElement | null {
  let node: Node | null = isHTMLElement(target) ? target : null
  while (isHTMLElement(node) && node !== root && !isLastTraversableNode(node)) {
    if (isScrollable(node, axis)) return node
    node = getParentNode(node)
  }

  return isScrollable(root, axis) ? root : null
}
