type ElementBounds = {
  left: number
  right: number
  top: number
  bottom: number
}

const BOUNDARY_OFFSET = 5

export function isMouseWithinBounds(event: MouseEvent, element: HTMLElement): boolean {
  const bounds = getPseudoElementBounds(element)

  return (
    event.clientX >= bounds.left - BOUNDARY_OFFSET &&
    event.clientX <= bounds.right + BOUNDARY_OFFSET &&
    event.clientY >= bounds.top - BOUNDARY_OFFSET &&
    event.clientY <= bounds.bottom + BOUNDARY_OFFSET
  )
}

export function getPseudoElementBounds(element: HTMLElement): ElementBounds {
  const elementRect = element.getBoundingClientRect()
  const win = element.ownerDocument.defaultView ?? window

  const beforeStyles = win.getComputedStyle(element, '::before')
  const afterStyles = win.getComputedStyle(element, '::after')

  const hasPseudoElements = beforeStyles.content !== 'none' || afterStyles.content !== 'none'

  if (!hasPseudoElements) {
    return elementRect
  }

  const beforeWidth = parseFloat(beforeStyles.width) || 0
  const beforeHeight = parseFloat(beforeStyles.height) || 0
  const afterWidth = parseFloat(afterStyles.width) || 0
  const afterHeight = parseFloat(afterStyles.height) || 0

  const totalWidth = Math.max(elementRect.width, beforeWidth, afterWidth)
  const totalHeight = Math.max(elementRect.height, beforeHeight, afterHeight)

  const widthDiff = totalWidth - elementRect.width
  const heightDiff = totalHeight - elementRect.height

  return {
    left: elementRect.left - widthDiff / 2,
    right: elementRect.right + widthDiff / 2,
    top: elementRect.top - heightDiff / 2,
    bottom: elementRect.bottom + heightDiff / 2
  }
}
