<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { SelectContext, type SelectIconState } from './context'

  type Props = PartProps<[SelectIconState], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const select = SelectContext.get()

  const stateAttrs = $derived(dataAttrs({ 'popup-open': select.open }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} aria-hidden="true" {...rest}>
  {#if children}
    {@render children({ open: select.open })}
  {:else}
    ▼
  {/if}
</svelte:element>
