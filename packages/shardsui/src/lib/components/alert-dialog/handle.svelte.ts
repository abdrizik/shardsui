import { DialogHandle } from '$lib/components/dialog/handle.svelte'

declare const alertDialogBrand: unique symbol

export class AlertDialogHandle<Payload = unknown> extends DialogHandle<Payload> {
  declare [alertDialogBrand]: void
}
