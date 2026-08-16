<script lang="ts">
  import { DialogPortalContext, DialogContext } from '$lib/components/dialog/context'
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { COMPOSITE_KEYS } from '$lib/internal/composite'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { DrawerContext, DrawerViewportContext, type DrawerPopupState } from './context'
  import { DrawerPopup } from './popup.svelte'

  type Props = PartProps<[DrawerPopupState], 'div', 'onkeydown'> & {
    initialFocus?: FocusTarget
    finalFocus?: FocusTarget
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id = uid,
    initialFocus,
    finalFocus,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const drawer = DrawerContext.get()
  const dialog = DialogContext.get()
  const portal = DialogPortalContext.getOr()
  const viewport = DrawerViewportContext.getOr()

  const popup = new DrawerPopup(dialog, drawer, viewport, () => ({
    ref,
    id,
    initialFocus,
    finalFocus,
    keepMounted: !!portal?.keepMounted
  }))

  const drawerState: DrawerPopupState = $derived({
    open: dialog.open,
    transitionStatus: dialog.transitionStatus,
    expanded: popup.expanded,
    nested: dialog.nested,
    nestedDrawerOpen: popup.nestedDrawerOpen,
    nestedDrawerSwiping: drawer.nestedSwiping,
    swipeDirection: drawer.swipeDirection,
    swiping: popup.swiping
  })

  const stateAttrs = $derived(
    dataAttrs({
      'swipe-direction': drawer.swipeDirection,
      nested: dialog.nested,
      expanded: popup.expanded,
      'nested-drawer-open': popup.nestedDrawerOpen,
      'nested-drawer-swiping': drawer.nestedSwiping,
      swiping: popup.swiping || drawer.swipeAreaActive,
      'swipe-dismiss': drawer.swipeDismissed,
      'ending-style': dialog.transitionStatus === 'ending' || popup.releasing
    })
  )
</script>

{#if popup.shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...dialog.transitionAttrs}
    {...stateAttrs}
    {@attach attachElement((el) => (dialog.popupElement = el))}
    {id}
    hidden={!dialog.mounted}
    style:--drawer-swipe-progress={popup.nestedSwipeProgress}
    style:--drawer-swipe-movement-x={popup.dragMovementX}
    style:--drawer-swipe-movement-y={popup.dragMovementY}
    style:--drawer-snap-point-offset="{popup.snapPointOffset}px"
    style:--drawer-swipe-strength={popup.swipeStrengthVar}
    style:--nested-drawers={dialog.nestedOpenDrawerCount}
    style:--drawer-height={popup.popupHeightVar}
    style:--drawer-frontmost-height={popup.frontmostHeightVar}
    style:transform={popup.dragTransform}
    style:transition={popup.dragTransition}
    {style}
    role={dialog.role}
    aria-labelledby={dialog.titleId}
    aria-describedby={dialog.descriptionId}
    tabindex={-1}
    data-shards-ui-focusable=""
    onkeydown={chain(onkeydown, (event) => {
      if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation()
    })}
    {...rest}
  >
    {@render children?.(drawerState)}
  </svelte:element>
{/if}
