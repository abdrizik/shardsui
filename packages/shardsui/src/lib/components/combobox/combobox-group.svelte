<script lang="ts">
  import { untrack } from 'svelte'
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxGroupContext, ComboboxGroupItemsContext } from './context'

  type Props = PartProps & {
    items?: readonly unknown[]
  }

  let { as = 'div', ref = $bindable(null), items, children, ...rest }: Props = $props()

  const group: ComboboxGroupContext = $state({ labelId: undefined })
  ComboboxGroupContext.set(group)

  if (untrack(() => items) !== undefined) {
    ComboboxGroupItemsContext.set({
      get items() {
        return items ?? []
      }
    })
  }
</script>

<svelte:element this={as} bind:this={ref} role="group" aria-labelledby={group.labelId} {...rest}>
  {@render children?.()}
</svelte:element>
