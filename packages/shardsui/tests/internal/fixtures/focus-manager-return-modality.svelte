<script lang="ts">
  import { dismiss, type DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import { REASONS } from '$lib/internal/reasons'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let lastCloseEvent = $state.raw<Event | null>(null)
  let lastCloseReason = $state.raw<string | null>(null)

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
    lastCloseEvent = null
    lastCloseReason = null
    open = true
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
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined,
    openMethod: 'mouse',
    closeEvent: lastCloseEvent,
    closeReason: lastCloseReason
  }))
</script>

<button data-testid="reference" bind:this={triggerElement} onclick={toggle}>reference</button>
{#if open}
  <div role="dialog" data-testid="floating" bind:this={popupElement}></div>
{/if}
