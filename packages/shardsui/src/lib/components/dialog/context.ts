import { Context } from '$lib/internal/context'
import type { REASONS } from '$lib/internal/reasons'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { DialogRoot } from './dialog.svelte'

export type DialogRole = 'dialog' | 'alertdialog'

export type DialogOpenReason =
  | typeof REASONS.triggerPress
  | typeof REASONS.outsidePress
  | typeof REASONS.escapeKey
  | typeof REASONS.closeWatcher
  | typeof REASONS.closePress
  | typeof REASONS.focusOut
  | typeof REASONS.imperativeAction
  | typeof REASONS.swipe

export type DialogPortalContext = { keepMounted: boolean }

export type DialogTriggerState = {
  disabled: boolean
  open: boolean
}

export type DialogCloseState = {
  disabled: boolean
}

export type DialogPopupState = {
  open: boolean
  transitionStatus: TransitionStatus
  nested: boolean
  nestedDialogOpen: boolean
}

export type DialogViewportState = DialogPopupState

export const DialogContext = new Context<DialogRoot>('Dialog.Root')

export const DialogPortalContext = new Context<DialogPortalContext>('Dialog.Portal')
