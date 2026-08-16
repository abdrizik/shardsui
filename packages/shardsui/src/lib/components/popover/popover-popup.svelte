<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import type { PartProps } from '$lib/internal/types'
  import {
    PopoverPositionerContext,
    PopoverContext,
    PopoverClosePartContext,
    type PopoverPopupState
  } from './context'
  import { ToolbarContext } from '$lib/components/toolbar/context'
  import { chain } from '$lib/internal/chain'
  import { COMPOSITE_KEYS } from '$lib/internal/composite'
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { hoverFloatingInteraction } from '$lib/internal/floating/hover/floating.svelte'
  import { publishCloseGuardContext } from '$lib/internal/floating/publish-close-guard-context.svelte'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import { REASONS } from '$lib/internal/reasons'
  import { mergeStyle } from '$lib/internal/merge-style'

  type Props = PartProps<[PopoverPopupState], 'div', 'onkeydown'> & {
    initialFocus?: FocusTarget
    finalFocus?: FocusTarget
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id = uid,
    initialFocus,
    finalFocus,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const popover = PopoverContext.get()
  const positioner = PopoverPositionerContext.get()
  const insideToolbar = ToolbarContext.getOr() != null

  let lastCloseEvent = $state.raw<Event | null>(null)

  const initialFocusTarget: FocusTarget = $derived(
    initialFocus ?? ((interactionType) => (interactionType === 'touch' ? (ref ?? true) : true))
  )

  PopoverClosePartContext.set({
    register: () => {
      popover.closePartCount++
      return () => popover.closePartCount--
    }
  })

  function registerPopupId() {
    popover.popupId = id
    return () => {
      popover.popupId = undefined
    }
  }

  openChangeComplete(() => ({
    open: popover.open,
    element: ref,
    onComplete: () => {
      if (popover.open) popover.onOpenChangeComplete?.(true)
    }
  }))

  manageFocus(() => ({
    open: popover.open,
    modal: popover.focusManagerModal,
    enabled: popover.mounted && popover.openChangeReason !== REASONS.triggerHover,
    popupElement: ref,
    triggerElement: popover.triggerElement,
    initialFocus: initialFocusTarget,
    finalFocus,
    openMethod: popover.openMethod,
    restoreFocus: 'popup',
    closeOnFocusOut: true,
    onFocusOut: (event) => {
      lastCloseEvent = event ?? null
      popover.setOpen(false, REASONS.focusOut, event)
    },
    getNextFocusableElement: () => popover.triggerFocusTargetElement,
    closeEvent: lastCloseEvent,
    closeReason: popover.openChangeReason
  }))

  dismiss(() => ({
    open: popover.open,
    tree: popover.floatingTree,
    nodeId: popover.floatingNodeId,
    popupElement: popover.floatingElement,
    referenceElement: popover.domReferenceElement,
    outsidePressEvent: {
      mouse: popover.modal === 'trap-focus' ? 'sloppy' : 'intentional',
      touch: 'sloppy'
    },
    onClose: (reason, event) => {
      const closeReason = reason === REASONS.escapeKey ? REASONS.escapeKey : REASONS.outsidePress
      lastCloseEvent = event ?? null
      popover.setOpen(false, closeReason, event)
    },
    isInsideElement: popover.containsTrigger
  }))

  hoverFloatingInteraction(popover, () => ({
    enabled: popover.openOnHover && !popover.triggerDisabled,
    closeDelay: popover.closeDelay,
    nodeId: popover.floatingNodeId
  }))

  publishCloseGuardContext(() => ({
    data: popover.data,
    side: positioner.renderedSide,
    domReference: popover.domReferenceElement,
    floating: popover.floatingElement
  }))

  const mergedStyle = $derived(
    mergeStyle(getDisabledMountTransitionStyles(popover.transitionStatus), style)
  )

  const popoverState: PopoverPopupState = $derived({
    open: popover.open,
    side: positioner.side,
    align: positioner.align,
    instant: popover.instantType,
    transitionStatus: popover.transitionStatus
  })

  const stateAttrs = $derived(anchoredPopupAttrs(popoverState))

  function stopCompositeKeys(event: KeyboardEvent) {
    if (insideToolbar && COMPOSITE_KEYS.has(event.key)) {
      event.stopPropagation()
    }
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (popover.popupElement = el))}
  {id}
  style={mergedStyle}
  role="dialog"
  tabindex={-1}
  data-shards-ui-focusable=""
  aria-labelledby={popover.titleId}
  aria-describedby={popover.descriptionId}
  onkeydown={chain(onkeydown, stopCompositeKeys)}
  {@attach registerPopupId}
  {...rest}
>
  {@render children?.(popoverState)}
</svelte:element>
