import { isNode } from '@floating-ui/utils/dom'

export function contains(
  parent: Element | null | undefined,
  child: EventTarget | null | undefined
): boolean {
  if (!parent || !isNode(child)) return false
  return parent.contains(child)
}

export function getTarget(event: Event): EventTarget | null {
  return event.composedPath()[0] ?? null
}
