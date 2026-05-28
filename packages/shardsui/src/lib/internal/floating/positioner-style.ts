import type { Attachment } from 'svelte/attachments'

export function positionerStyle(getStyles: () => Record<string, string>): Attachment<HTMLElement> {
  let managed: string[] = []
  let seededElement: HTMLElement | null = null
  return (el) => {
    if (seededElement !== el) {
      seededElement = el
      el.style.setProperty('--available-width', '100vw')
      el.style.setProperty('--available-height', '100vh')
    }
    const next = getStyles()
    for (const prop of managed) {
      if (!(prop in next)) el.style.removeProperty(prop)
    }
    for (const prop in next) {
      el.style.setProperty(prop, next[prop])
    }
    managed = Object.keys(next)
  }
}
