import { Context } from '$lib/internal/context'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { TabsList } from './list.svelte'
import type { TabsRoot, TabsState } from './tabs.svelte'

export type TabPosition = {
  left: number
  right: number
  top: number
  bottom: number
}

export type TabSize = {
  width: number
  height: number
}

export type TabsTabState = TabsState & {
  active: boolean
  disabled: boolean
}

export type TabsPanelState = TabsState & {
  hidden: boolean
  transitionStatus: TransitionStatus
}

export type TabsIndicatorState = TabsState & {
  activeTabPosition: TabPosition | null
  activeTabSize: TabSize | null
}

export const TabsContext = new Context<TabsRoot>('Tabs.Root')

export const TabsListContext = new Context<TabsList>('Tabs.List')
