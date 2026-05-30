<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import {
    AnchorPositioning,
    type Side,
    type Boundary,
    type CollisionAvoidance,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import { POPUP_COLLISION_AVOIDANCE } from '$lib/internal/constants'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'
  import type { ToastObject } from './types'
  import {
    ToastProviderContext,
    ToastPositionerContext,
    type ToastPositionerState
  } from './context'

  type Props = PartProps<[ToastPositionerState]> &
    AnchorPositioningProps & {
      toast: ToastObject
      anchor?: Element | null
    }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    toast,
    side: sideProp,
    align: alignProp,
    sideOffset: sideOffsetProp,
    alignOffset: alignOffsetProp,
    collisionBoundary: collisionBoundaryProp,
    collisionPadding: collisionPaddingProp,
    collisionAvoidance: collisionAvoidanceProp,
    sticky: stickyProp,
    arrowPadding: arrowPaddingProp,
    disableAnchorTracking: disableAnchorTrackingProp,
    anchor: anchorProp,
    positionMethod: positionMethodProp,
    children,
    ...rest
  }: Props = $props()

  const provider = ToastProviderContext.get()

  const posProps = $derived(toast.positionerProps ?? {})
  const anchor = $derived<Element | null>(
    (anchorProp !== undefined ? anchorProp : posProps.anchor) ?? null
  )
  const side = $derived<Side>(sideProp ?? posProps.side ?? 'top')
  const align = $derived(alignProp ?? posProps.align)
  const sideOffset = $derived(sideOffsetProp ?? posProps.sideOffset)
  const alignOffset = $derived(alignOffsetProp ?? posProps.alignOffset)
  const collisionBoundary = $derived<Boundary>(
    collisionBoundaryProp ?? posProps.collisionBoundary ?? 'clipping-ancestors'
  )
  const collisionPadding = $derived(collisionPaddingProp ?? posProps.collisionPadding)
  const collisionAvoidance = $derived<CollisionAvoidance>(
    collisionAvoidanceProp ?? posProps.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE
  )
  const sticky = $derived(stickyProp ?? posProps.sticky)
  const arrowPadding = $derived(arrowPaddingProp ?? posProps.arrowPadding)
  const disableAnchorTracking = $derived(
    disableAnchorTrackingProp ?? posProps.disableAnchorTracking
  )
  const positionMethod = $derived(positionMethodProp ?? posProps.positionMethod)

  const positioning = new AnchorPositioning(() => ({
    anchor,
    floating: ref,
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

  ToastPositionerContext.set(positioning)

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const toastIndex = $derived(provider.stackIndexOf(toast))

  const toastState: ToastPositionerState = $derived({
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden
  })

  const stateAttrs = $derived(
    dataAttrs({
      side: positioning.side,
      align: positioning.align,
      'anchor-hidden': positioning.anchorHidden
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {style}
  {@attach positionerStyleAttach}
  style:transition={toast.transitionStatus === 'starting' ? 'none' : undefined}
  style:--toast-index={toastIndex}
  role="presentation"
  {...rest}
>
  {@render children?.(toastState)}
</svelte:element>
