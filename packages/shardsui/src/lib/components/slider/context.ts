import { Context } from '$lib/internal/context'
import type { SliderRoot } from './slider.svelte'

export const SliderContext = new Context<SliderRoot>('Slider.Root')
