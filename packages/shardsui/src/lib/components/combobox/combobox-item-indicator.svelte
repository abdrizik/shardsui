<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxItemContext, type ComboboxItemIndicatorState } from './context'
  import { ItemIndicator } from '$lib/internal/item-indicator.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'

  type Props = PartProps<[ComboboxItemIndicatorState], 'span'> & {
    keepMounted?: boolean
  }

  let {
    as = 'span',
    ref = $bindable(null),
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const item = ComboboxItemContext.get()
  const indicator = new ItemIndicator(() => ({ keepMounted, element: ref, open: item.selected }))

  const stateAttrs = $derived(dataAttrs({ selected: item.selected }))
</script>

{#if indicator.shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...stateAttrs}
    {...indicator.stateAttrs}
    aria-hidden="true"
    {...rest}
  >
    {#if children}
      {@render children({
        selected: item.selected,
        transitionStatus: indicator.transitionStatus
      })}
    {:else}
      ✔️
    {/if}
  </svelte:element>
{/if}
