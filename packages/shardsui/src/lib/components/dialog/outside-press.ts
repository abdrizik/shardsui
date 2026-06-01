import { SHARDSUI_PORTAL_ATTRIBUTE } from '$lib/internal/constants'
import { contains, getTarget } from '$lib/internal/dom'
import type { DialogRoot } from './dialog.svelte'

export function outsidePressEvent(
  dialog: DialogRoot
): 'intentional' | { mouse: 'sloppy' | 'intentional'; touch: 'sloppy' } {
  if (dialog.internalBackdropElement || dialog.backdropElement) return 'intentional'
  return {
    mouse: dialog.modal === 'trap-focus' ? 'sloppy' : 'intentional',
    touch: 'sloppy'
  }
}

/**
 * Whether an outside press dismisses this dialog: `false` disables dismissal, otherwise a predicate
 * that only accepts presses on the dialog's own backdrop so stacked, non-nested modals stay open.
 */
export function outsidePress(
  dialog: DialogRoot,
  popupElement: HTMLElement | null
): false | ((event: MouseEvent | TouchEvent) => boolean) {
  if (dialog.disablePointerDismissal) return false
  if (dialog.nestedOpenCount !== 0) return false
  return (event) => {
    if (!dialog.outsidePressEnabled) return false
    if ('button' in event && event.button !== 0) return false
    if ('touches' in event) {
      if (event.type === 'touchend') {
        if (event.changedTouches.length !== 1 || event.touches.length !== 0) return false
      } else if (event.touches.length !== 1) {
        return false
      }
    }
    if (!dialog.modal) return true

    const target = getTarget(event) as Element | null
    const internalBackdrop = dialog.internalBackdropElement
    const backdrop = dialog.backdropElement
    if (!internalBackdrop && !backdrop) return true
    return (
      target === internalBackdrop ||
      target === backdrop ||
      (target != null &&
        contains(target, popupElement) &&
        !target.hasAttribute(SHARDSUI_PORTAL_ATTRIBUTE))
    )
  }
}
