<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { PopoverContext, PopoverPositionerContext, type PopoverPositionerState } from './context'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import InternalBackdrop from '$lib/internal/internal-backdrop.svelte'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { createAnimationsFinished } from '$lib/internal/animations-finished.svelte'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { anchoredPopupScrollLock } from '$lib/internal/floating/anchored-popup-scroll-lock.svelte'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'
  import { REASONS } from '$lib/internal/reasons'

  type Props = PartProps<[PopoverPositionerState]> & AnchorPositioningProps

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding,
    collisionAvoidance,
    sticky,
    arrowPadding,
    disableAnchorTracking = false,
    anchor,
    positionMethod,
    children,
    ...rest
  }: Props = $props()

  const popover = PopoverContext.get()
  AnchoredPortalContext.get()

  let prevTriggerElement: Element | null = null

  const anchorElement = $derived(anchor ?? popover.triggerElement)

  const positioning = new AnchorPositioning(() => ({
    anchor: popover.mounted ? anchorElement : null,
    floating: popover.mounted ? ref : null,
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
    adaptiveOrigin: popover.hasViewport
  }))

  const animationsFinished = createAnimationsFinished(() => ({
    element: ref
  }))

  $effect.pre(() => {
    const currentTrigger = popover.triggerElement
    const prev = prevTriggerElement

    if (currentTrigger) {
      prevTriggerElement = currentTrigger
    }

    if (prev && currentTrigger && currentTrigger !== prev) {
      popover.instantType = undefined
      const ac = new AbortController()
      animationsFinished.run(() => {
        popover.instantType = 'trigger-change'
      }, ac.signal)
      return () => ac.abort()
    }
  })

  const modalNonHover = $derived(
    popover.modal === true && popover.openChangeReason !== REASONS.triggerHover
  )

  anchoredPopupScrollLock(() => ({
    enabled: popover.open && modalNonHover,
    touchOpen: popover.openMethod === 'touch',
    positionerElement: ref,
    referenceElement: popover.triggerElement
  }))

  PopoverPositionerContext.set(positioning)

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const showBackdrop = $derived(popover.mounted && modalNonHover)

  const popoverState: PopoverPositionerState = $derived({
    open: popover.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: popover.instantType
  })

  const stateAttrs = $derived(anchoredPositionerAttrs(popoverState))
</script>

{#if showBackdrop}
  <InternalBackdrop inert={!popover.open} cutout={popover.triggerElement} />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (popover.positionerElement = el))}
  {style}
  {@attach positionerStyleAttach}
  style:transition={popover.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!popover.open ? 'none' : undefined}
  hidden={!popover.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(popoverState)}
</svelte:element>
