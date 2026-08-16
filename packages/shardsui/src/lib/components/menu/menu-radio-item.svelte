<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import {
    MenuRadioGroupContext,
    MenuRadioItemContext,
    type MenuCheckableItemState
  } from './context'
  import { MenuItemBase } from './item-base.svelte'

  type Props = PartProps<
    [MenuCheckableItemState],
    'div',
    | 'onclick'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousemove'
    | 'onmouseup'
    | 'onpointerdown'
    | 'onpointerleave'
  > & {
    value: unknown
    disabled?: boolean
    closeOnClick?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    value,
    disabled: disabledProp = false,
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

  const group = MenuRadioGroupContext.get()

  const checked = $derived(group.value === value)
  const disabled = $derived(disabledProp || group.disabled)

  const item = new MenuItemBase(() => ({
    disabled,
    closeOnClick,
    ref
  }))

  function selectOnClick(event: MouseEvent) {
    group.setValue(value)
    item.onclick(event)
  }

  const btn = new Button(() => ({
    disabled: item.disabled,
    focusableWhenDisabled: true,
    as,
    composite: true,
    onclick: chain(onclick, selectOnClick),
    onmousedown,
    onkeydown: chain(onkeydown, item.onkeydown),
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(
    dataAttrs({
      checked,
      unchecked: !checked,
      highlighted: item.highlighted,
      disabled: item.disabled
    })
  )

  MenuRadioItemContext.set({
    get checked() {
      return checked
    },
    get disabled() {
      return item.disabled
    },
    get highlighted() {
      return item.highlighted
    }
  })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {id}
  role="menuitemradio"
  aria-checked={checked}
  tabindex={item.tabindex}
  onmousemove={chain(onmousemove, item.onmousemove)}
  onpointerleave={chain(onpointerleave, item.onpointerleave)}
  onmouseup={chain(onmouseup, item.onmouseup)}
  {...rest}
>
  {@render children?.({ checked, highlighted: item.highlighted, disabled: item.disabled })}
</svelte:element>
