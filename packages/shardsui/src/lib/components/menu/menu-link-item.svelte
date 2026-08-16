<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import type { MenuLinkItemState } from './context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { MenuItemBase } from './item-base.svelte'

  type Props = PartProps<
    [MenuLinkItemState],
    'a',
    | 'onclick'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousemove'
    | 'onmouseup'
    | 'onpointerdown'
    | 'onpointerleave'
  > & {
    closeOnClick?: boolean
  }

  const uid = $props.id()

  let {
    as = 'a',
    ref = $bindable(null),
    id = uid,
    closeOnClick = false,
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
    disabled: false,
    closeOnClick,
    ref
  }))

  const btn = new Button(() => ({
    as,
    composite: true,
    onclick: chain(onclick, item.onclick),
    onmousedown,
    onkeydown: chain(onkeydown, item.onkeydown),
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(dataAttrs({ highlighted: item.highlighted }))
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
  {@render children?.({ highlighted: item.highlighted })}
</svelte:element>
