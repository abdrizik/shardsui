<script lang="ts" generics="Payload = unknown">
  import { untrack } from 'svelte'
  import type { PartProps } from '$lib/internal/types'
  import type { PopoverHandle } from './handle.svelte'
  import { Button } from '$lib/internal/button.svelte'
  import { isClickLikeEvent } from '$lib/internal/floating/event'
  import { chain } from '$lib/internal/chain'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
  import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
  import { TriggerRegistration } from '$lib/internal/trigger-registration.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import { TriggerFocusGuards } from '$lib/internal/floating/trigger-focus-guards.svelte'
  import { PopoverContext, type PopoverTriggerState } from './context'
  import type { PopoverRoot } from './popover.svelte'

  type Props = PartProps<[PopoverTriggerState], 'button'> & {
    handle?: PopoverHandle<Payload>
    disabled?: boolean
    openOnHover?: boolean
    delay?: number
    closeDelay?: number
    payload?: Payload
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    handle,
    disabled = false,
    openOnHover = false,
    delay = 300,
    closeDelay = 0,
    payload,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const popover: PopoverRoot = untrack(() => (handle ? handle.state : PopoverContext.get()))

  const registration = new TriggerRegistration(
    () => ({ id, ref, root: popover }),
    () => ({ payload, disabled, openOnHover, closeDelay }),
    popover.applyTriggerBindings
  )

  const showTriggerGuards = $derived(
    registration.isMountedByThisTrigger && !popover.focusManagerModal
  )

  const ownsOrSoloOpen = $derived(
    registration.isActiveOpen ||
      (popover.open && popover.activeTriggerId == null && popover.triggerElements.size === 1)
  )

  const safePolygonGuard = safePolygon()

  hoverReferenceInteraction(popover, () => ({
    enabled:
      openOnHover &&
      !disabled &&
      (popover.openMethod !== 'touch' || popover.openChangeReason !== REASONS.triggerPress),
    mouseOnly: true,
    move: false,
    closeGuard: safePolygonGuard,
    restMs: delay,
    delay: { close: closeDelay },
    triggerElement: ref,
    isActiveTrigger: registration.isTriggerActive
  }))

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, toggleOpen),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown: chain(onpointerdown, forwardOpenPointerDown)
  }))

  const guards = new TriggerFocusGuards(() => ({
    close: (event) => popover.setOpen(false, REASONS.focusOut, event),
    positionerElement: popover.positionerElement,
    popupElement: popover.popupElement,
    triggerFocusTargetElement: popover.triggerFocusTargetElement
  }))

  const popoverState: PopoverTriggerState = $derived({
    disabled,
    open: registration.isActiveOpen
  })

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': registration.isActiveOpen,
      pressed: registration.isActiveOpen && popover.openChangeReason === REASONS.triggerPress,
      disabled
    })
  )

  function toggleOpen(event: MouseEvent) {
    popover.openInteractionHandlers?.onclick(event)
    if (popover.open && popover.triggerElement !== ref) {
      popover.setOpen(true, REASONS.triggerPress, event, ref)
      return
    }

    const openEventType = popover.data.openEvent?.type
    if (popover.open && popover.stickIfOpen && openEventType && !isClickLikeEvent(openEventType)) {
      popover.setOpen(true, REASONS.triggerPress, event, ref)
      return
    }

    popover.setOpen(!popover.open, REASONS.triggerPress, event, ref)
  }

  function forwardOpenPointerDown(event: PointerEvent) {
    popover.openInteractionHandlers?.onpointerdown(event)
  }
</script>

{#if showTriggerGuards}
  <FocusGuard bind:ref={guards.preFocusGuardElement} onfocus={guards.closeAndFocusBefore} />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {id}
  aria-haspopup="dialog"
  aria-expanded={registration.isActiveOpen}
  aria-controls={ownsOrSoloOpen ? popover.popupId : undefined}
  data-shards-ui-click-trigger=""
  {...rest}
>
  {@render children?.(popoverState)}
</svelte:element>
{#if showTriggerGuards}
  <FocusGuard bind:ref={popover.triggerFocusTargetElement} onfocus={guards.closeAndFocusAfter} />
{/if}
