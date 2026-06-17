<script lang="ts">
  import type { Snippet } from 'svelte'
  import { hasNullItemLabel, resolveSelectedLabel } from '$lib/internal/resolve-value-label'
  import { ComboboxContext } from './context'

  type Props = {
    placeholder?: string
    children?: Snippet<[unknown]>
  }

  let { placeholder, children }: Props = $props()

  const combobox = ComboboxContext.get()

  const displayText = $derived.by(() => {
    const v = combobox.value
    const showsPlaceholder = !combobox.hasSelectedValue && placeholder != null
    const hasNullLabel = showsPlaceholder && children == null && hasNullItemLabel(combobox.items)

    if (showsPlaceholder && !hasNullLabel) {
      return placeholder
    }
    if (combobox.multiple && Array.isArray(v)) {
      return combobox.selectedValues
        .map((item) => resolveSelectedLabel(item, combobox.items, combobox.itemToStringLabel))
        .join(', ')
    }
    return resolveSelectedLabel(v, combobox.items, combobox.itemToStringLabel)
  })
</script>

{#if children}
  {@render children(combobox.value)}
{:else}
  {displayText}
{/if}
