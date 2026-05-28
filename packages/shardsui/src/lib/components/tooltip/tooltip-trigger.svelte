<script module lang="ts">
  import { untrack } from 'svelte'
  const OPEN_DELAY = 600
</script>

<script lang="ts" generics="Payload = unknown">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { chain } from '$lib/internal/chain'
  import { DelayGroupMember } from './delay-group.svelte'
  import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
  import { getDelay } from '$lib/internal/floating/hover/predicates'
  import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
  import { createFocusReference } from '$lib/internal/floating/focus-reference.svelte'
  import { TriggerRegistration } from '$lib/internal/trigger-registration.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { TooltipProviderContext, TooltipContext, type TooltipTriggerState } from './context'
  import type { TooltipHandle } from './handle.svelte'
  import type { TooltipRoot } from './tooltip.svelte'

  type Props = PartProps<[TooltipTriggerState], 'button'> & {
    handle?: TooltipHandle<Payload>
    disabled?: boolean
    delay?: number
    closeDelay?: number
    closeOnClick?: boolean
    payload?: Payload
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    handle,
    disabled: disabledProp,
    delay,
    closeDelay,
    closeOnClick = true,
    payload,
    onfocus,
    onblur,
    onpointerdown,
    onpointerenter,
    onmousemove,
    onmouseleave,
    onclick,
    children,
    ...rest
  }: Props = $props()

  const tooltip: TooltipRoot = untrack(() => (handle ? handle.state : TooltipContext.get()))
  const provider = TooltipProviderContext.getOr()

  const disabled = $derived(disabledProp ?? tooltip.disabled)

  const focus = createFocusReference(() => ({
    enabled: !disabled,
    open: tooltip.open,
    openChangeReason: tooltip.openChangeReason,
    triggerElement: ref,
    activeTriggerElement: tooltip.triggerElement,
    popupElement: tooltip.popupElement,
    triggerElements: tooltip.triggerElements,
    setOpen: tooltip.setOpen
  }))

  const registration = new TriggerRegistration(
    () => ({ id, ref, root: tooltip }),
    () => ({ payload, closeDelay: closeDelay ?? 0, closeOnClick }),
    tooltip.applyTriggerBindings
  )

  const delayGroup = provider
    ? new DelayGroupMember(provider.delayGroup, tooltip, () => ({
        open: registration.isActiveOpen,
        floatingId: tooltip.floatingId
      }))
    : null

  if (delayGroup) {
    $effect(() => {
      tooltip.isInstantPhase = delayGroup.isInstantPhase
    })
  }

  const safePolygonGuard = safePolygon()

  const restMs = $derived(
    getDelay(provider?.delayGroup.delay, 'open') === 0
      ? 0
      : (delay ?? provider?.delay ?? OPEN_DELAY)
  )
  const hoverDelay = $derived({
    close: closeDelay ?? (provider ? getDelay(provider.delayGroup.delay, 'close') : 0)
  })

  hoverReferenceInteraction(tooltip, () => ({
    enabled: !disabled,
    mouseOnly: true,
    move: false,
    closeGuard:
      !tooltip.disableHoverablePopup && tooltip.trackCursorAxis !== 'both'
        ? safePolygonGuard
        : null,
    restMs,
    delay: hoverDelay,
    triggerElement: ref,
    isActiveTrigger: registration.isTriggerActive
  }))

  const tooltipState: TooltipTriggerState = $derived({ open: registration.isActiveOpen })

  function cancelDelayedOpen() {
    if (closeOnClick && !tooltip.open) tooltip.cancelPendingOpen()
  }

  function cancelOpenOnPress() {
    tooltip.closeOnClick = closeOnClick
    cancelDelayedOpen()
  }

  function trackCursor(event: MouseEvent) {
    if (tooltip.trackCursorAxis !== 'none' && !tooltip.open) {
      tooltip.setCursorPosition(event.clientX, event.clientY)
    }
  }

  const stateAttrs = $derived(
    dataAttrs({ 'popup-open': registration.isActiveOpen, 'trigger-disabled': disabled })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {id}
  onpointerdown={chain(onpointerdown, cancelOpenOnPress)}
  onpointerenter={chain(onpointerenter, trackCursor)}
  onmousemove={chain(onmousemove, trackCursor)}
  onmouseleave={chain(onmouseleave, focus.reset)}
  onclick={chain(onclick, cancelDelayedOpen)}
  onfocus={chain(onfocus, focus.onfocus)}
  onblur={chain(onblur, focus.onblur)}
  {...rest}
>
  {@render children?.(tooltipState)}
</svelte:element>
