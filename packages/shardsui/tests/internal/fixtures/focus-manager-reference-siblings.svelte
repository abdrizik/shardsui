<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined
  }))
</script>

<div data-testid="outside-wrapper">
  <input data-testid="reference" bind:this={triggerElement} onclick={() => (open = !open)} />
  <button data-testid="btn-1" aria-label="btn-1"></button>
  <button data-testid="btn-2" aria-label="btn-2"></button>
  <div data-testid="nested-wrapper">
    <button data-testid="nested-btn" aria-label="nested-btn"></button>
  </div>
</div>
<div data-testid="outside-sibling"></div>
{#if open}
  <div role="listbox" bind:this={popupElement} data-testid="floating"></div>
{/if}
