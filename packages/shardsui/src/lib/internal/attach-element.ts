import type { Attachment } from 'svelte/attachments'

export function attachElement<T extends Element = HTMLElement>(
  set: (node: T | null) => void
): Attachment<T> {
  return (node) => {
    set(node)
    return () => set(null)
  }
}
