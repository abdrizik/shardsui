<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { formatNumber } from '$lib/internal/format-number'
  import { SliderContext } from './context'

  type Props = PartProps<[string[], number[]], 'output'>

  let {
    as = 'output',
    ref = $bindable(null),
    'aria-live': ariaLive = 'off',
    children,
    ...rest
  }: Props = $props()

  const slider = SliderContext.get()

  const formattedValues = $derived(
    slider.values.map((value) => formatNumber(value, slider.locale, slider.format))
  )
  const htmlFor = $derived(slider.thumbInputIds.join(' ') || undefined)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...slider.stateAttrs}
  aria-live={ariaLive}
  for={htmlFor}
  {...rest}
>
  {#if children}
    {@render children(formattedValues, slider.values)}
  {:else}
    {formattedValues.join(' – ')}
  {/if}
</svelte:element>
