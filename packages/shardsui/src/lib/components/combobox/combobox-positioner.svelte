<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import {
    ComboboxContext,
    ComboboxPositionerContext,
    type ComboboxPositionerState
  } from './context'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import InternalBackdrop from '$lib/internal/internal-backdrop.svelte'
  import { DROPDOWN_COLLISION_AVOIDANCE } from '$lib/internal/constants'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { scrollLock } from '$lib/internal/scroll-lock.svelte'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'
  import { attachElement } from '$lib/internal/attach-element'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { dataAttrs } from '$lib/internal/data-attrs'

  type Props = PartProps<[ComboboxPositionerState]> & AnchorPositioningProps

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
    collisionAvoidance = { side: 'flip', align: 'flip', ...DROPDOWN_COLLISION_AVOIDANCE },
    sticky,
    arrowPadding,
    disableAnchorTracking,
    anchor,
    positionMethod,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  AnchoredPortalContext.get()

  const anchorElement = $derived(
    anchor ??
      (combobox.inputInsidePopup
        ? combobox.triggerElement
        : (combobox.inputGroupElement ?? combobox.inputElement))
  )

  const positioning = new AnchorPositioning(() => ({
    anchor: combobox.mounted ? anchorElement : null,
    floating: combobox.mounted ? ref : null,
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
    disableAnchorTracking,
    lazyFlip: true
  }))

  scrollLock(() => ({
    enabled: combobox.open && combobox.modal,
    referenceElement: combobox.inputGroupElement ?? combobox.inputElement ?? combobox.triggerElement
  }))

  $effect.pre(() => {
    combobox.popupSide = combobox.mounted ? positioning.side : null
    return () => {
      combobox.popupSide = null
    }
  })

  ComboboxPositionerContext.set(positioning)

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const showBackdrop = $derived(combobox.mounted && combobox.modal)
  const backdropCutout = $derived(
    combobox.inputGroupElement ?? combobox.inputElement ?? combobox.triggerElement
  )

  const comboboxState: ComboboxPositionerState = $derived({
    open: combobox.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    empty: combobox.isEmpty
  })

  const stateAttrs = $derived({
    ...anchoredPositionerAttrs(comboboxState),
    ...dataAttrs({ empty: combobox.isEmpty })
  })
</script>

{#if showBackdrop}
  <InternalBackdrop inert={!combobox.open} cutout={backdropCutout} />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {style}
  {@attach positionerStyleAttach}
  {@attach attachElement((el) => (combobox.positionerElement = el))}
  style:transition={combobox.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!combobox.open ? 'none' : undefined}
  hidden={!combobox.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
