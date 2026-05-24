import { Context } from '$lib/internal/context'
import type { ProgressRoot } from './progress.svelte'

export const ProgressContext = new Context<ProgressRoot>('Progress.Root')
