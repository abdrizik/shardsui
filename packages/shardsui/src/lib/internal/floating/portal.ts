import { isElement } from '@floating-ui/utils/dom'
import type { Attachment } from 'svelte/attachments'
import { SHARDSUI_PORTAL_SELECTOR } from '../constants'
import { contains } from '../dom'

const portalOrigins = new WeakMap<Element, Element>()

export function portalTo(container: HTMLElement | null | undefined): Attachment {
  return (node) => {
    const origin = portalOrigins.get(node) ?? node.parentElement
    const target = container ?? origin?.closest(SHARDSUI_PORTAL_SELECTOR) ?? node.ownerDocument.body
    if (origin) {
      portalOrigins.set(node, origin)
    }
    target.appendChild(node)
    return () => {
      node.remove()
    }
  }
}

export function containsThroughPortals(
  container: Element | null | undefined,
  target: Node | null | undefined
): boolean {
  if (!container || !target) return false

  let node: Node | null = target
  while (node) {
    if (contains(container, node)) return true
    const element: Element | null = isElement(node) ? node : node.parentElement
    const portal: Element | null = element?.closest(SHARDSUI_PORTAL_SELECTOR) ?? null
    if (!portal) return false
    node = portalOrigins.get(portal) ?? null
  }

  return false
}
