import { dismiss } from '$lib/internal/floating/dismiss.svelte'
import { scrollLock } from '$lib/internal/scroll-lock.svelte'
import type { DialogRoot } from './dialog.svelte'
import { outsidePress, outsidePressEvent } from './outside-press'

type DialogInteractionsOptions = {
  dialog: DialogRoot
  popupElement: HTMLElement | null
}

export function dialogInteractions(options: () => DialogInteractionsOptions): void {
  scrollLock(() => ({
    enabled: options().dialog.open && options().dialog.modal === true,
    referenceElement: options().popupElement
  }))

  dismiss(() => ({
    open: options().dialog.open,
    onClose: (reason, event) => {
      options().dialog.setOpen(false, reason, event)
    },
    escapeKey: options().dialog.nestedOpenCount === 0,
    outsidePressEvent: outsidePressEvent(options().dialog),
    outsidePress: outsidePress(options().dialog, options().popupElement),
    popupElement: options().popupElement,
    referenceElement: options().dialog.activeTrigger,
    isInsideElement: (target) => options().dialog.containsTrigger(target)
  }))
}
