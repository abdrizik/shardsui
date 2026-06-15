<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import type { SliderState } from './slider.svelte'
  import { SliderContext } from './context'

  type Props = PartProps<[SliderState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const slider = SliderContext.get()

  const mergedStyle = $derived(mergeStyle('position: relative', style))
</script>

<svelte:element this={as} bind:this={ref} {...slider.stateAttrs} style={mergedStyle} {...rest}>
  {@render children?.(slider.state)}
</svelte:element>
