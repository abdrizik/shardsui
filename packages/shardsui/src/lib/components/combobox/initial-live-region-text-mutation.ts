import { isIOS } from '$lib/internal/detect-browser'
import { Timeout } from '$lib/internal/timeout'
import type { Attachment } from 'svelte/attachments'

// Word Joiner is invisible and zero-width, so it forces a text mutation without shifting layout.
const LIVE_REGION_MARKER = '\u2060'
// Safari VoiceOver needed roughly 200ms to reliably notice the initial polite live-region change.
const INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY = 200

function findLastTextNode(root: HTMLElement): Text | null {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let lastTextNode: Text | null = null

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    if (textNode.data !== '') {
      lastTextNode = textNode
    }
  }

  return lastTextNode
}

export const initialLiveRegionTextMutation: Attachment = (node) => {
  if (isIOS) {
    return undefined
  }

  const root = node as HTMLElement
  const textNode = findLastTextNode(root)
  if (textNode == null) {
    return undefined
  }

  const originalValue = textNode.data
  const markedValue = `${originalValue}${LIVE_REGION_MARKER}`
  textNode.data = markedValue

  const timeout = new Timeout()
  timeout.start(INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY, () => {
    if (textNode.data === markedValue) {
      textNode.data = originalValue
    }
  })

  return () => {
    timeout.clear()
    if (textNode.data === markedValue) {
      textNode.data = originalValue
    }
  }
}
