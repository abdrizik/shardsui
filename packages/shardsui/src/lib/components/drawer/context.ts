import type { DialogRoot } from '$lib/components/dialog/dialog.svelte'
import { Context } from '$lib/internal/context'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { DrawerRoot, DrawerSwipeDirection } from './drawer.svelte'
import type { DrawerSwipe } from './swipe.svelte'

export type DrawerPopupState = {
  open: boolean
  transitionStatus: TransitionStatus
  expanded: boolean
  nested: boolean
  nestedDrawerOpen: boolean
  nestedDrawerSwiping: boolean
  swipeDirection: DrawerSwipeDirection
  swiping: boolean
}

export type DrawerSwipeAreaState = {
  open: boolean
  swiping: boolean
  swipeDirection: DrawerSwipeDirection
  disabled: boolean
}

export type DrawerIndentState = {
  active: boolean
}

export type DrawerVisual = {
  swipeProgress: number
  frontmostHeight: number
}

export type DrawerProviderContext = {
  active: boolean
  setDrawerOpen: (drawer: DialogRoot, open: boolean) => void
  visualState: DrawerVisual
  setVisualState: (state: DrawerVisual) => void
}

export const DrawerContext = new Context<DrawerRoot>('Drawer.Root')

export const DrawerViewportContext = new Context<DrawerSwipe>('Drawer.Viewport')

export const DrawerProviderContext = new Context<DrawerProviderContext>('Drawer.Provider')
