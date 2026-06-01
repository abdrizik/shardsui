import { MenuLikeHandle } from '$lib/internal/detached-handle'
import { warn } from '$lib/internal/log'
import { REASONS } from '$lib/internal/reasons'
import { DialogRoot } from './dialog.svelte'

export class DialogHandle<Payload = unknown> extends MenuLikeHandle<DialogRoot<Payload>> {
  constructor() {
    super(new DialogRoot<Payload>(), 'Dialog', false)
  }

  override get state(): DialogRoot<Payload> {
    return this.root.current
  }

  override open = (triggerId: string | null): void => {
    this.openByTrigger(triggerId)
  }

  openWithPayload = (payload: Payload): void => {
    const current = this.state
    if (!current.attached) {
      warn(
        'DialogHandle.openWithPayload() was called while no root using this handle is mounted.',
        'The call and its payload were ignored.'
      )
      return
    }
    current.payload = payload
    current.triggerElement = null
    current.setOpen(true, REASONS.imperativeAction)
  }
}
