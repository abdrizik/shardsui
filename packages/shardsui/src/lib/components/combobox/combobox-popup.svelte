<script lang="ts">
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import { isTypeableCombobox } from '$lib/internal/floating/tabbable'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import { getTarget, contains } from '$lib/internal/dom'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import ComboboxInternalDismissButton from './combobox-internal-dismiss-button.svelte'
  import { ComboboxPositionerContext, ComboboxContext, type ComboboxPopupState } from './context'

  type Props = PartProps<[ComboboxPopupState]> & {
    initialFocus?: FocusTarget
    finalFocus?: FocusTarget
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id: idProp,
    initialFocus,
    finalFocus,
    onfocusin,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const positioner = ComboboxPositionerContext.getOr()

  const id = $derived(
    idProp ?? (combobox.inputInsidePopup ? `${combobox.rootId}-popup` : undefined)
  )

  function registerPopupId() {
    combobox.popupId = id
    return () => {
      combobox.popupId = undefined
    }
  }

  openChangeComplete(() => ({
    open: combobox.open,
    element: ref,
    onComplete: () => {
      if (combobox.open) combobox.onOpenChangeComplete?.(true)
    }
  }))

  dismiss(() => ({
    open: combobox.open,
    enabled: !combobox.readOnly && !combobox.disabled && !combobox.inline,
    popupElement: combobox.positionerElement,
    outsidePressEvent: { mouse: 'sloppy', touch: 'intentional' },
    onClose: (reason, event) => {
      const closeReason = reason === REASONS.escapeKey ? REASONS.escapeKey : REASONS.outsidePress
      combobox.setOpen(false, closeReason, event)
    },
    isInsideElement: (target) => {
      if (contains(ref, target)) return true
      if (contains(combobox.triggerElement, target)) return true
      if (contains(combobox.clearElement, target)) return true
      if (contains(combobox.chipsContainerElement, target)) return true
      if (contains(combobox.inputElement, target)) return true
      return contains(combobox.inputGroupElement, target)
    }
  }))

  const computedDefaultInitialFocus: FocusTarget = $derived(
    combobox.inputInsidePopup
      ? (interactionType: string) => (interactionType === 'touch' ? ref : combobox.inputElement)
      : false
  )

  const resolvedInitialFocus = $derived(
    initialFocus === undefined ? computedDefaultInitialFocus : initialFocus
  )

  const resolvedFinalFocus: FocusTarget = $derived(
    finalFocus ?? (combobox.inputInsidePopup ? undefined : false)
  )

  const untrappedTypeableCombobox = $derived(
    resolvedInitialFocus === false && isTypeableCombobox(combobox.inputElement)
  )

  manageFocus(() => ({
    open: combobox.open,
    modal: combobox.focusManagerModal,
    enabled: combobox.mounted,
    popupElement: ref,
    triggerElement: combobox.inputInsidePopup ? combobox.triggerElement : combobox.inputElement,
    openMethod: combobox.openMethod,
    initialFocus: resolvedInitialFocus,
    finalFocus: resolvedFinalFocus,
    insideElements: [combobox.startDismissElement, combobox.endDismissElement],
    closeReason: combobox.openChangeReason,
    closeEvent: combobox.lastCloseEvent,
    closeOnFocusOut: untrappedTypeableCombobox || !combobox.focusManagerModal,
    onFocusOut: (event) => {
      combobox.setOpen(false, REASONS.focusOut, event)
    }
  }))

  const mergedStyle = $derived(
    mergeStyle(getDisabledMountTransitionStyles(combobox.transitionStatus), style)
  )

  const popupRole = $derived(combobox.inputInsidePopup ? 'dialog' : 'presentation')

  function redirectFocusToInput(event: FocusEvent) {
    const target = getTarget(event) as Element | null
    const isFromList = contains(combobox.listElement, target) || target === ref
    if (combobox.openMethod !== 'touch' && isFromList) {
      combobox.inputElement?.focus()
    }
  }

  const side = $derived(positioner?.side ?? 'bottom')
  const align = $derived(positioner?.align ?? 'center')
  const anchorHidden = $derived(positioner?.anchorHidden ?? false)

  const comboboxState: ComboboxPopupState = $derived({
    open: combobox.open,
    side,
    align,
    anchorHidden,
    transitionStatus: combobox.transitionStatus,
    empty: combobox.isEmpty
  })

  const stateAttrs = $derived({
    ...anchoredPopupAttrs(comboboxState),
    ...dataAttrs({ 'anchor-hidden': anchorHidden, empty: combobox.isEmpty })
  })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (combobox.popupElement = el))}
  {@attach registerPopupId}
  {id}
  style={mergedStyle}
  role={popupRole}
  tabindex={-1}
  data-shards-ui-focusable=""
  onfocusin={chain(onfocusin, redirectFocusToInput)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
{#if combobox.focusManagerModal}
  <ComboboxInternalDismissButton bind:ref={combobox.endDismissElement} />
{/if}
