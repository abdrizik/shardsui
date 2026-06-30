<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open: true,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined
  }))
</script>

<button data-testid="reference" aria-label="reference" bind:this={triggerElement}></button>
<div bind:this={popupElement} data-testid="floating" tabindex="-1"></div>
