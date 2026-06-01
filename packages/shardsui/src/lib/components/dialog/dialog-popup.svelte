<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { COMPOSITE_KEYS } from '$lib/internal/composite'
  import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import { dialogInteractions } from './interactions.svelte'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import type { PartProps } from '$lib/internal/types'
  import { DialogPortalContext, DialogContext, type DialogPopupState } from './context'

  type Props = PartProps<[DialogPopupState]> & {
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

  const dialog = DialogContext.get()
  const portal = DialogPortalContext.getOr()

  const initialFocusTarget: FocusTarget = $derived(
    initialFocus ?? ((interactionType) => (interactionType === 'touch' ? (ref ?? true) : true))
  )

  function registerPopupId() {
    dialog.popupId = id
    return () => {
      dialog.popupId = undefined
    }
  }

  openChangeComplete(() => ({
    open: dialog.open,
    element: ref,
    onComplete: () => {
      if (dialog.open) dialog.onOpenChangeComplete?.(true)
    }
  }))

  dialogInteractions(() => ({ dialog, popupElement: ref }))

  manageFocus(() => ({
    open: dialog.open,
    modal: dialog.modal !== false,
    enabled: dialog.mounted,
    popupElement: ref,
    triggerElement: dialog.activeTrigger,
    openMethod: dialog.openMethod,
    initialFocus: initialFocusTarget,
    finalFocus,
    closeOnFocusOut: !dialog.disablePointerDismissal,
    onFocusOut: (event) => {
      dialog.setOpen(false, REASONS.focusOut, event)
    },
    restoreFocus: 'popup',
    closeEvent: dialog.lastCloseEvent,
    closeReason: dialog.openChangeReason
  }))

  const shouldRender = $derived(dialog.mounted || !!portal?.keepMounted)

  const dialogState: DialogPopupState = $derived({
    open: dialog.open,
    transitionStatus: dialog.transitionStatus,
    nested: dialog.nested,
    nestedDialogOpen: dialog.nestedOpenCount > 0
  })
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...dialog.transitionAttrs}
    {...dialog.nestedAttrs}
    {@attach attachElement((el) => (dialog.popupElement = el))}
    {id}
    hidden={!dialog.mounted}
    {style}
    style:--nested-dialogs={dialog.nestedOpenCount}
    tabindex={-1}
    data-shards-ui-focusable=""
    role={dialog.role}
    aria-labelledby={dialog.titleId}
    aria-describedby={dialog.descriptionId}
    onkeydown={chain(onkeydown, (event) => {
      if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation()
    })}
    {@attach registerPopupId}
    {...rest}
  >
    {@render children?.(dialogState)}
  </svelte:element>
{/if}
