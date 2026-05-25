import { Context } from '$lib/internal/context'
import type { MeterRoot } from './meter.svelte'

export const MeterContext = new Context<MeterRoot>('Meter.Root')
