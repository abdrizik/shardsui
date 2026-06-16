<script lang="ts">
  import { hasNullItemLabel } from '$lib/internal/resolve-value-label'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { SelectContext } from './context'

  type Props = PartProps<[unknown], 'span'> & {
    placeholder?: string
  }

  let { as = 'span', ref = $bindable(null), placeholder, children, ...rest }: Props = $props()

  const select = SelectContext.get()

  const hasNullLabel = $derived(!select.hasValue && hasNullItemLabel(select.items))

  const showPlaceholder = $derived(!select.hasValue && placeholder != null && !hasNullLabel)

  const stateAttrs = $derived(dataAttrs({ placeholder: !select.hasValue }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest}>
  {#if children}
    {@render children(select.value)}
  {:else if showPlaceholder}
    {placeholder}
  {:else}
    {select.selectedLabel}
  {/if}
</svelte:element>
