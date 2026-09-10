<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import type { AnchorPositioningProps } from '$lib/internal/floating/anchor-positioning.svelte'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { FloatingNodeContext } from '$lib/internal/floating/floating-tree.svelte'
  import InternalBackdrop from '$lib/internal/internal-backdrop.svelte'
  import { MenuPositionerContext, MenuContext, type MenuPositionerState } from './context'
  import { MenuPositioner } from './positioner.svelte'

  type Props = PartProps<[MenuPositionerState]> & AnchorPositioningProps

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    collisionAvoidance,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    anchor,
    positionMethod,
    children,
    ...rest
  }: Props = $props()

  const menu = MenuContext.get()
  AnchoredPortalContext.get()

  FloatingNodeContext.set({
    get id() {
      return menu.nodeId
    }
  })

  const positioner = new MenuPositioner(menu, () => ({
    ref,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    collisionAvoidance,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    anchor,
    positionMethod
  }))

  const positioning = positioner.positioning

  MenuPositionerContext.set(positioning)

  const nested = $derived(menu.parentType === 'menu')

  const menuState = $derived<MenuPositionerState>({
    open: menu.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    nested,
    instant: menu.instantType
  })

  const stateAttrs = $derived({
    ...anchoredPositionerAttrs(menuState),
    ...dataAttrs({ nested })
  })
</script>

{#if positioner.shouldRenderBackdrop}
  <InternalBackdrop
    bind:ref={menu.internalBackdropElement}
    inert={!menu.open}
    cutout={positioner.backdropCutout}
  />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (menu.positionerElement = el))}
  {style}
  {@attach positioner.styleAttach}
  style:transition={menu.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!menu.open ? 'none' : undefined}
  hidden={!menu.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(menuState)}
</svelte:element>
