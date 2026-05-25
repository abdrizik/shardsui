<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { MeterContext } from './context'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const meter = MeterContext.get()

  const indicatorStyle = $derived(
    mergeStyle(`inset-inline-start:0;height:inherit;width:${meter.percentageValue}%`, style)
  )
</script>

<svelte:element this={as} bind:this={ref} style={indicatorStyle} {...rest}>
  {@render children?.()}
</svelte:element>
