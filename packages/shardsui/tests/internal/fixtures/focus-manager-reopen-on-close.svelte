<script lang="ts">
  import { dismiss, type DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import { REASONS } from '$lib/internal/reasons'

  let open = $state(false)
  let reopenOnClose = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let lastCloseEvent = $state.raw<Event | null>(null)
  let lastCloseReason = $state.raw<string | null>(null)

  function openPopup() {
    lastCloseEvent = null
    lastCloseReason = null
    open = true
  }

  function close(reason: DismissReason | string, event: Event) {
    lastCloseEvent = event
    lastCloseReason = reason
    open = false
  }

  function toggle(event: MouseEvent) {
    if (open) {
      close(REASONS.triggerPress, event)
      return
    }
    openPopup()
  }

  dismiss(() => ({
    open,
    onClose: close,
    popupElement,
    referenceElement: triggerElement,
    isInsideElement: (target) =>
      !!popupElement?.contains(target) || !!triggerElement?.contains(target)
  }))

  manageFocus(() => ({
    open,
    modal: true,
    enabled: open,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined,
    openMethod: 'mouse',
    closeEvent: lastCloseEvent,
    closeReason: lastCloseReason
  }))

  $effect(() => {
    if (!open && reopenOnClose) {
      reopenOnClose = false
      open = true
    }
  })
</script>

<span data-testid="open-state">{String(open)}</span>
<button data-testid="reference" aria-label="reference" bind:this={triggerElement} onclick={toggle}
></button>
<button
  data-testid="reopen-on-close"
  aria-label="reopen on close"
  onclick={() => (reopenOnClose = true)}
></button>
<div bind:this={popupElement}>
  <button data-testid="child" aria-label="child"></button>
</div>
