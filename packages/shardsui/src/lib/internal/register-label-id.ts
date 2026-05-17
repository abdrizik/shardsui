import type { Attachment } from 'svelte/attachments'

/** Publishes the label's id to the labelled context for as long as the element is mounted. */
export function registerLabelId(target: { labelId: string | undefined }, id: string): Attachment {
  return () => {
    target.labelId = id
    return () => {
      if (target.labelId === id) target.labelId = undefined
    }
  }
}
