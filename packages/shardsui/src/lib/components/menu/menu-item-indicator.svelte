<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { ItemIndicator } from '$lib/internal/item-indicator.svelte'
  import type { MenuCheckableItemState, MenuItemIndicatorState } from './context'

  type Props = PartProps<[MenuItemIndicatorState], 'span'> & {
    item: MenuCheckableItemState
    keepMounted?: boolean
  }

  let {
    as = 'span',
    ref = $bindable(null),
    item,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const indicator = new ItemIndicator(() => ({ keepMounted, element: ref, open: item.checked }))

  const menuState = $derived<MenuItemIndicatorState>({
    checked: item.checked,
    disabled: item.disabled,
    highlighted: item.highlighted,
    transitionStatus: indicator.transitionStatus
  })

  const stateAttrs = $derived(
    dataAttrs({
      checked: item.checked,
      unchecked: !item.checked,
      disabled: item.disabled,
      highlighted: item.highlighted
    })
  )
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
    {@render children?.(menuState)}
  </svelte:element>
{/if}
