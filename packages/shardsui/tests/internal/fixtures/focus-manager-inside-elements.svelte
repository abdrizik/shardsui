<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let dismissElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined,
    insideElements: [dismissElement]
  }))
</script>

<input data-testid="reference" bind:this={triggerElement} onclick={() => (open = !open)} />
<div data-testid="outside-wrapper">
  <button data-testid="outside-button" aria-label="outside-button"></button>
</div>
{#if open}
  <div bind:this={popupElement} data-testid="floating"></div>
  <button bind:this={dismissElement} data-testid="dismiss" aria-label="dismiss"></button>
{/if}
