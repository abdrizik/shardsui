<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { MeterContext } from './context'

  type Props = PartProps<[string, number], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const meter = MeterContext.get()
</script>

<svelte:element this={as} bind:this={ref} aria-hidden="true" {...rest}>
  {#if children}
    {@render children(meter.formattedValue, meter.value)}
  {:else}
    {meter.formattedValue}
  {/if}
</svelte:element>
