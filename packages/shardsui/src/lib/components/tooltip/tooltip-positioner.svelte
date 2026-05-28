<script lang="ts">
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { attachElement } from '$lib/internal/attach-element'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'
  import { getTarget, contains } from '$lib/internal/dom'
  import type { PartProps } from '$lib/internal/types'
  import { on } from 'svelte/events'
  import { TooltipContext, TooltipPositionerContext, type TooltipPositionerState } from './context'

  type Props = PartProps<[TooltipPositionerState]> & AnchorPositioningProps

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    side = 'top',
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

  const tooltip = TooltipContext.get()
  AnchoredPortalContext.get()

  $effect(() => {
    if (tooltip.trackCursorAxis === 'none' || !tooltip.mounted || !tooltip.openedByMouseEvent)
      return

    const win = ref?.ownerDocument.defaultView ?? window

    return on(win, 'mousemove', (event) => {
      const target = getTarget(event) as Element | null
      if (contains(tooltip.popupElement, target)) return
      tooltip.setCursorPosition(event.clientX, event.clientY)
    })
  })

  const anchorElement = $derived(anchor ?? tooltip.triggerElement)

  const virtualAnchor = $derived.by(() => {
    const axis = tooltip.trackCursorAxis
    const anchorEl = anchorElement
    if (axis === 'none' || !anchorEl || !tooltip.openedByMouseEvent) return null
    const x = tooltip.cursorX
    const y = tooltip.cursorY
    if (x == null || y == null) return null
    return {
      getBoundingClientRect(): DOMRect {
        const anchorRect = anchorEl.getBoundingClientRect()
        return new DOMRect(
          axis === 'y' ? anchorRect.x : x,
          axis === 'x' ? anchorRect.y : y,
          axis === 'y' ? anchorRect.width : 0,
          axis === 'x' ? anchorRect.height : 0
        )
      }
    }
  })

  const resolvedAnchor = $derived(virtualAnchor ?? anchorElement)

  const positioning = new AnchorPositioning(() => ({
    anchor: tooltip.mounted ? resolvedAnchor : null,
    floating: tooltip.mounted ? ref : null,
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
    adaptiveOrigin: tooltip.hasViewport
  }))

  TooltipPositionerContext.set(positioning)

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const instant = $derived(
    tooltip.trackCursorAxis !== 'none' ? 'tracking-cursor' : tooltip.instantType
  )

  const tooltipState: TooltipPositionerState = $derived({
    open: tooltip.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant
  })

  const stateAttrs = $derived(anchoredPositionerAttrs(tooltipState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (tooltip.positionerElement = el))}
  {style}
  {@attach positionerStyleAttach}
  style:transition={tooltip.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!tooltip.open ||
  tooltip.trackCursorAxis === 'both' ||
  tooltip.disableHoverablePopup
    ? 'none'
    : undefined}
  hidden={!tooltip.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(tooltipState)}
</svelte:element>
