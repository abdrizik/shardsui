type ModifierState = {
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
}

export function dispatchClickWithModifiers(
  target: Element,
  sourceEvent: ModifierState,
  { detail = 0 }: { detail?: number } = {}
): void {
  const win = target.ownerDocument.defaultView ?? window
  target.dispatchEvent(
    new win.PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
      shiftKey: sourceEvent.shiftKey,
      ctrlKey: sourceEvent.ctrlKey,
      altKey: sourceEvent.altKey,
      metaKey: sourceEvent.metaKey
    })
  )
}
