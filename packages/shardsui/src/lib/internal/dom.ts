export function contains(
  parent: Element | null | undefined,
  child: Node | null | undefined
): boolean {
  if (!parent || !child) return false
  return parent.contains(child)
}

export function getTarget(event: Event): EventTarget | null {
  return event.composedPath()[0] ?? null
}
