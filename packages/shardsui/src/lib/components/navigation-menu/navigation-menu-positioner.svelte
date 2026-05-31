<script lang="ts">
  import { isElement } from '@floating-ui/utils/dom'
  import { attachElement } from '$lib/internal/attach-element'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from '$lib/internal/constants'
  import { Timeout } from '$lib/internal/timeout'
  import { anchoredPositionerAttrs } from '$lib/internal/anchored-state'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import {
    AnchorPositioning,
    type AnchorPositioningProps
  } from '$lib/internal/floating/anchor-positioning.svelte'
  import { positionerStyle } from '$lib/internal/floating/positioner-style'
  import { publishCloseGuardContext } from '$lib/internal/floating/publish-close-guard-context.svelte'
  import {
    disableFocusInside,
    enableFocusInside,
    isOutsideEvent
  } from '$lib/internal/floating/tabbable'
  import type { PartProps } from '$lib/internal/types'
  import { flushSync } from 'svelte'
  import { on } from 'svelte/events'
  import {
    NavigationMenuContext,
    NavigationMenuPositionerContext,
    type NavigationMenuPositionerState
  } from './context'

  type Props = PartProps<[NavigationMenuPositionerState]> & AnchorPositioningProps

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    collisionAvoidance: collisionAvoidanceProp,
    sticky = false,
    arrowPadding = 5,
    disableAnchorTracking = false,
    anchor,
    positionMethod = 'absolute',
    children,
    ...rest
  }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  AnchoredPortalContext.get()

  const initialInstantTimeout = new Timeout()
  $effect(initialInstantTimeout.disposeEffect)
  const resizeTimeout = new Timeout()
  $effect(resizeTimeout.disposeEffect)
  let needsInitialInstantReset = false
  let instant = $state(false)

  if (navigationMenu.open) {
    instant = true
    needsInitialInstantReset = true
  }

  $effect(() => {
    const element = ref
    if (!element) return

    function syncFocusInside(event: FocusEvent) {
      if (element && isOutsideEvent(event, element)) {
        const focusing = event.type === 'focusin'
        const manageFocus = focusing ? enableFocusInside : disableFocusInside
        manageFocus(element)
      }
    }

    const offIn = on(element, 'focusin', syncFocusInside, { capture: true })
    const offOut = on(element, 'focusout', syncFocusInside, { capture: true })
    return () => {
      offIn()
      offOut()
    }
  })

  const collisionAvoidance = $derived(
    collisionAvoidanceProp ??
      (navigationMenu.nested ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE)
  )

  const anchorElement = $derived(
    anchor ?? navigationMenu.activeTriggerElement ?? navigationMenu.prevTriggerElement
  )

  const positioning = new AnchorPositioning(() => ({
    anchor: navigationMenu.mounted ? anchorElement : null,
    floating: navigationMenu.mounted ? ref : null,
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
    shift: { rootBoundary: 'layoutViewport' },
    adaptiveOrigin: true
  }))

  $effect(() => {
    if (!navigationMenu.open || !ref) return

    if (needsInitialInstantReset) {
      initialInstantTimeout.start(0, () => {
        needsInitialInstantReset = false
        if (!resizeTimeout.isStarted()) {
          instant = false
        }
      })
    }

    function onresize() {
      // `data-instant` must land on the positioner before the resize repositions it, or the
      // menu animates to the new position instead of jumping.
      flushSync(() => {
        instant = true
      })
      resizeTimeout.start(100, () => {
        instant = false
      })
    }

    const win = ref.ownerDocument.defaultView ?? window
    return on(win, 'resize', onresize)
  })

  publishCloseGuardContext(() => ({
    data: navigationMenu.data,
    enabled: navigationMenu.open && !!ref,
    side: positioning.renderedSide,
    domReference: isElement(anchorElement) ? anchorElement : null,
    floating: ref,
    nodeId: navigationMenu.floatingNodeId
  }))

  const positionerStyleAttach = positionerStyle(() => positioning.positionerStyles)

  const navigationMenuState: NavigationMenuPositionerState = $derived({
    open: navigationMenu.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant
  })

  const stateAttrs = $derived({
    ...anchoredPositionerAttrs({ ...navigationMenuState, instant: undefined }),
    ...dataAttrs({ instant })
  })

  NavigationMenuPositionerContext.set(positioning)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (navigationMenu.positionerElement = el))}
  {style}
  {@attach positionerStyleAttach}
  style:transition={navigationMenu.transitionStatus === 'starting' ? 'none' : undefined}
  style:pointer-events={!navigationMenu.open ? 'none' : undefined}
  hidden={!navigationMenu.mounted}
  role="presentation"
  {...rest}
>
  {@render children?.(navigationMenuState)}
</svelte:element>
