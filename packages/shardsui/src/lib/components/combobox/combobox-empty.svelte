<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxContext } from './context'
  import { initialLiveRegionTextMutation } from './initial-live-region-text-mutation'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const combobox = ComboboxContext.get()

  const visible = $derived(
    combobox.hasItems ? combobox.flatFilteredItems.length === 0 : combobox.isEmpty
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {@attach attachElement((el) => (combobox.emptyElement = el))}
  {@attach initialLiveRegionTextMutation}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  {...rest}
>
  {#if visible}
    {@render children?.()}
  {/if}
</svelte:element>
