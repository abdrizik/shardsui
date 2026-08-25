import { getParentNode, isHTMLElement, isLastTraversableNode, isNode } from '@floating-ui/utils/dom'

export function findRootOwnerId(node: EventTarget | null | undefined): string | undefined {
  if (!isNode(node)) return undefined
  if (isHTMLElement(node) && node.hasAttribute('data-rootownerid')) {
    return node.getAttribute('data-rootownerid') ?? undefined
  }
  if (isLastTraversableNode(node)) {
    return undefined
  }
  return findRootOwnerId(getParentNode(node))
}
