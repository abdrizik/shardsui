<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { SelectContext, SelectPositionerContext, type SelectPositionerState } from './context'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import InternalBackdrop from '$lib/internal/internal-backdrop.svelte'
  import { DROPDOWN_COLLISION_AVOIDANCE } from '$lib/internal/constants'
  import { anchoredPopupScrollLock } from '$lib/internal/floating/anchored-popup-scroll-lock.svelte'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'

  type Props = PartProps<[SelectPositionerState]> & AnchorPositioningProps

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
    collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    anchor,
    positionMethod,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()

  anchoredPopupScrollLock(() => ({
    enabled: select.open && select.modal,
    touchOpen: select.openMethod === 'touch',
    positionerElement: ref,
    referenceElement: select.triggerElement
  }))

  const anchorElement = $derived(anchor ?? select.triggerElement)

  const positioning = new AnchorPositioning(() => ({
    anchor: select.mounted ? anchorElement : null,
    floating: select.mounted ? ref : null,
    side,
    align,
    sideOffset,
    alignOffset,
    positionMethod,
    collisionBoundary,
    collisionPadding,
    collisionAvoidance,
    sticky,
    arrowPadding,
    disableAnchorTracking
  }))

  $effect.pre(() => {
    select.popupSide = select.mounted ? positioning.side : null
    return () => {
      select.popupSide = null
    }
  })

  SelectPositionerContext.set(positioning)

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const showBackdrop = $derived(select.mounted && select.modal)

  const selectState = $derived({
    open: select.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden
  })

  const stateAttrs = $derived(anchoredPositionerAttrs(selectState))
</script>

{#if showBackdrop}
  <InternalBackdrop inert={!select.open} cutout={select.triggerElement} />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (select.positionerElement = el))}
  {style}
  {@attach positionerStyleAttach}
  style:transition={select.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!select.open ? 'none' : undefined}
  hidden={!select.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(selectState)}
</svelte:element>
