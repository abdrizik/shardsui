import { Context } from '$lib/internal/context'
import type { Orientation } from '$lib/internal/types'
import type { ScrollAreaRoot, ScrollAreaRootState } from './scroll-area.svelte'

export type ScrollAreaScrollbarContext = {
  orientation: Orientation
}

export type ScrollAreaScrollbarState = ScrollAreaRootState & {
  hovering: boolean
  orientation: Orientation
}

export type ScrollAreaThumbState = {
  scrolling: boolean
  orientation: Orientation
}

export const ScrollAreaContext = new Context<ScrollAreaRoot>('ScrollArea.Root')
export const ScrollAreaScrollbarContext = new Context<ScrollAreaScrollbarContext>(
  'ScrollArea.Scrollbar'
)
