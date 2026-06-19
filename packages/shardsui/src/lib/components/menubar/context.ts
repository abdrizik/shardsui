import { Context } from '$lib/internal/context'
import type { MenubarRoot } from './menubar.svelte'

export const MenubarContext = new Context<MenubarRoot>('Menubar')
