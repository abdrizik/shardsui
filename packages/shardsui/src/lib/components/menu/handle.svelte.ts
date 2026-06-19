import { MenuLikeHandle } from '$lib/internal/detached-handle'
import { MenuRoot } from './menu.svelte'

export class MenuHandle<Payload = unknown> extends MenuLikeHandle<MenuRoot<Payload>> {
  constructor() {
    super(new MenuRoot<Payload>(), 'Menu')
  }
}
