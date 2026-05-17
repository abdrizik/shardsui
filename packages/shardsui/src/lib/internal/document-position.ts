export function sortByDocumentPosition(a: Element, b: Element) {
  const position = a.compareDocumentPosition(b)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}

export function insertInDocumentOrder<T extends { element: Element }>(items: T[], item: T): number {
  let pos = items.length
  for (let i = 0; i < items.length; i += 1) {
    if (sortByDocumentPosition(items[i].element, item.element) > 0) {
      pos = i
      break
    }
  }
  items.splice(pos, 0, item)
  return pos
}
