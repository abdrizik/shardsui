<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuItemContext,
    NavigationMenuContext,
    type NavigationMenuIconState
  } from './context'

  type Props = PartProps<[NavigationMenuIconState], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const item = NavigationMenuItemContext.get()

  const isActive = $derived(navigationMenu.open && item.value === navigationMenu.value)

  const stateAttrs = $derived(dataAttrs({ 'popup-open': isActive }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} aria-hidden="true" {...rest}>
  {#if children}
    {@render children({ open: isActive })}
  {:else}
    ▼
  {/if}
</svelte:element>
