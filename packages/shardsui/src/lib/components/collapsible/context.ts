import { Context } from '$lib/internal/context'
import type { CollapsibleRoot } from './collapsible.svelte'

export const CollapsibleContext = new Context<CollapsibleRoot>('Collapsible.Root')
