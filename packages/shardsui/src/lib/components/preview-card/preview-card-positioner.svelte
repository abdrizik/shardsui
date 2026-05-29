<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import {
    PreviewCardContext,
    PreviewCardPositionerContext,
    type PreviewCardPositionerState
  } from './context'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { createInlineMiddleware } from '$lib/internal/floating/inline-rect'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'

  type Props = PartProps<[PreviewCardPositionerState]> & AnchorPositioningProps

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

  const previewCard = PreviewCardContext.get()
  AnchoredPortalContext.get()

  const anchorElement = $derived(anchor ?? previewCard.triggerElement)

  const inlineMiddleware = createInlineMiddleware(() => previewCard.inlineRectCoords)

  const positioning = new AnchorPositioning(() => ({
    anchor: previewCard.mounted ? anchorElement : null,
    floating: previewCard.mounted ? ref : null,
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
    adaptiveOrigin: previewCard.hasViewport,
    inline: inlineMiddleware
  }))

  PreviewCardPositionerContext.set(positioning)

  // `inlineRectCoords` is a plain field, so the inline middleware's read of it is untracked and
  // a reopen onto a new line would otherwise reuse the previous line's position.
  $effect(() => {
    if (previewCard.open && previewCard.mounted) {
      positioning.update()
    }
  })

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const previewCardState: PreviewCardPositionerState = $derived({
    open: previewCard.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: previewCard.instantType
  })

  const stateAttrs = $derived(anchoredPositionerAttrs(previewCardState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (previewCard.positionerElement = el))}
  {style}
  {@attach positionerStyleAttach}
  style:transition={previewCard.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!previewCard.open ? 'none' : undefined}
  hidden={!previewCard.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(previewCardState)}
</svelte:element>
