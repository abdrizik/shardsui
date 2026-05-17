export function setTemporaryStyle(
  element: HTMLElement,
  property: string,
  value: string,
  priority?: string
): () => void {
  const previousValue = element.style.getPropertyValue(property)
  const previousPriority = element.style.getPropertyPriority(property)

  element.style.setProperty(property, value, priority)

  return () => {
    if (previousValue === '') {
      element.style.removeProperty(property)
      return
    }
    element.style.setProperty(property, previousValue, previousPriority)
  }
}

export function setTemporaryStyles(
  element: HTMLElement,
  styles: Record<string, string>,
  priority?: string
): () => void {
  const restorers = Object.entries(styles).map(([property, value]) =>
    setTemporaryStyle(element, property, value, priority)
  )
  return () => {
    for (const restore of restorers) restore()
  }
}
