<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import { REASONS } from '$lib/internal/reasons'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let lastCloseEvent = $state<Event | null>(null)

  function close(event: Event) {
    lastCloseEvent = event
    open = false
  }

  manageFocus(() => ({
    open,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: undefined,
    finalFocus: undefined,
    closeEvent: lastCloseEvent,
    closeReason: REASONS.triggerHover
  }))
</script>

<button
  bind:this={triggerElement}
  data-testid="reference"
  aria-label="reference"
  onmouseenter={() => (open = true)}
  onmouseleave={close}
></button>
{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div bind:this={popupElement} data-testid="floating" tabindex="-1" onmouseleave={close}></div>
{/if}
<button>outside</button>
