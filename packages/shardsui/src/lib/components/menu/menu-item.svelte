<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import type { MenuItemState } from './context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { MenuItemBase } from './item-base.svelte'

  type Props = PartProps<
    [MenuItemState],
    'div',
    | 'onclick'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousemove'
    | 'onmouseup'
    | 'onpointerdown'
    | 'onpointerleave'
  > & {
    disabled?: boolean
    closeOnClick?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    disabled = false,
    closeOnClick = true,
    onclick,
    onmousedown,
    onmousemove,
    onpointerleave,
    onmouseup,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const item = new MenuItemBase(() => ({
    disabled,
    closeOnClick,
    ref
  }))

  const btn = new Button(() => ({
    disabled: item.disabled,
    focusableWhenDisabled: true,
    as,
    composite: true,
    onclick: chain(onclick, item.onclick),
    onmousedown,
    onkeydown: chain(onkeydown, item.onkeydown),
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(dataAttrs({ highlighted: item.highlighted, disabled: item.disabled }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {id}
  role="menuitem"
  tabindex={item.tabindex}
  onmousemove={chain(onmousemove, item.onmousemove)}
  onpointerleave={chain(onpointerleave, item.onpointerleave)}
  onmouseup={chain(onmouseup, item.onmouseup)}
  {...rest}
>
  {@render children?.({ highlighted: item.highlighted, disabled: item.disabled })}
</svelte:element>
