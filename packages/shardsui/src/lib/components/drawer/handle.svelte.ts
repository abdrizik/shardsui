import { DialogHandle } from '$lib/components/dialog/handle.svelte'

declare const drawerBrand: unique symbol

export class DrawerHandle<Payload = unknown> extends DialogHandle<Payload> {
  declare [drawerBrand]: void
}
