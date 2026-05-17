import { getParentNode, isElement, isLastTraversableNode } from '@floating-ui/utils/dom'
import { SHARDSUI_INERT_SELECTOR, SHARDSUI_PORTAL_SELECTOR } from './constants'
import { contains } from './dom'

function getTopLevelAncestor(element: Element): Element {
  let ancestor = element
  while (!isLastTraversableNode(ancestor)) {
    const parent = getParentNode(ancestor)
    if (isLastTraversableNode(parent) || !isElement(parent)) break
    ancestor = parent
  }
  return ancestor
}

/**
 * An open popup marks every element outside it as inert, so an element whose top-level ancestor
 * carries no marker was injected into the document after the popup opened — a cookie banner or
 * extension overlay, which should receive the interaction instead of dismissing the popup.
 */
export function isInjectedAfterOpen(target: Element, popupElement: Element | null): boolean {
  const markerRoot = popupElement?.ownerDocument ?? document
  const markers = Array.from(markerRoot.querySelectorAll(SHARDSUI_INERT_SELECTOR))

  if (markers.length === 0) return false
  if (target.matches('html,body')) return false
  if (popupElement && contains(target, popupElement)) return false

  // A portal is relocated to its container after the markers are applied, so its contents carry
  // none.
  if (target.closest(SHARDSUI_PORTAL_SELECTOR)) return false

  const ancestor = getTopLevelAncestor(target)
  return markers.every((marker) => !contains(ancestor, marker))
}
