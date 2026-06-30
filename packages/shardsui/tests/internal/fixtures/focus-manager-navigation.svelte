<script lang="ts">
  import { dismiss, type DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import { REASONS } from '$lib/internal/reasons'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let lastCloseEvent = $state.raw<Event | null>(null)
  let lastCloseReason = $state.raw<string | null>(null)

  function openSubnavigation() {
    lastCloseEvent = null
    lastCloseReason = null
    open = true
  }

  function close(reason: DismissReason | string, event: Event) {
    lastCloseEvent = event
    lastCloseReason = reason
    open = false
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
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: false,
    finalFocus: undefined,
    openMethod: 'mouse',
    closeEvent: lastCloseEvent,
    closeReason: lastCloseReason
  }))
</script>

<nav>
  <ul>
    <li><a href="#home">Home</a></li>
    <li>
      <a
        href="#product"
        bind:this={triggerElement}
        onmouseenter={openSubnavigation}
        onmouseleave={(event) => close(REASONS.triggerHover, event)}
      >
        Product
      </a>
    </li>
    <li><a href="#about">About</a></li>
  </ul>
</nav>
{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    data-testid="subnavigation"
    tabindex="-1"
    bind:this={popupElement}
    onmouseleave={(event) => close(REASONS.triggerHover, event)}
  >
    <button type="button" onclick={(event) => close(REASONS.closePress, event)}>Close</button>
    <ul>
      <li><a href="#link-1">Link 1</a></li>
      <li><a href="#link-2">Link 2</a></li>
      <li><a href="#link-3">Link 3</a></li>
    </ul>
  </div>
{/if}
