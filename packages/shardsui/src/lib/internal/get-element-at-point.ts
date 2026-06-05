export function getElementAtPoint(
  root: (Node & Partial<Pick<Document, 'elementFromPoint'>>) | null | undefined,
  x: number,
  y: number
): Element | null {
  return typeof root?.elementFromPoint === 'function' ? root.elementFromPoint(x, y) : null
}
