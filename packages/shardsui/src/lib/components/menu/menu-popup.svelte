<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'
  import type { PartProps } from '$lib/internal/types'
  import { ToolbarContext } from '$lib/components/toolbar/context'
  import { MenuPositionerContext, MenuContext, type MenuPopupState } from './context'
  import { MenuPopup } from './popup.svelte'

  type Props = PartProps<[MenuPopupState]> & {
    finalFocus?: FocusTarget
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id = uid,
    finalFocus,
    onkeydown,
    onmousemove,
    onpointermove,
    onclick,
    onfocusout,
    children,
    ...rest
  }: Props = $props()

  const menu = MenuContext.get()
  const positioner = MenuPositionerContext.getOr()
  const insideToolbar = ToolbarContext.getOr() != null
  const direction = DirectionContext.get()

  const popup = new MenuPopup(menu, positioner, direction, insideToolbar, () => ({
    ref,
    id,
    style,
    finalFocus
  }))

  const menuState = $derived<MenuPopupState>({
    transitionStatus: menu.transitionStatus,
    side: popup.side,
    align: popup.align,
    open: menu.open,
    nested: popup.nested,
    instant: menu.instantType
  })

  const stateAttrs = $derived({
    ...anchoredPopupAttrs(menuState),
    ...dataAttrs({ nested: popup.nested })
  })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach popup.registerPopup}
  {id}
  style={popup.mergedStyle}
  role="menu"
  aria-orientation={menu.orientation}
  aria-labelledby={menu.triggerElement?.id}
  tabindex={-1}
  data-shards-ui-focusable=""
  data-rootownerid={menu.rootId}
  onkeydown={chain(onkeydown, popup.onkeydown)}
  onmousemove={chain(onmousemove, popup.onmousemove)}
  onpointermove={chain(onpointermove, popup.onpointermove)}
  onclick={chain(onclick, popup.onclick)}
  onfocusout={chain(onfocusout, popup.onfocusout)}
  {...rest}
>
  {@render children?.(menuState)}
</svelte:element>
