<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let { hasTabbableContent = false }: { hasTabbableContent?: boolean } = $props()

  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open: true,
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: false,
    finalFocus: undefined
  }))
</script>

<button data-testid="reference" aria-label="reference" bind:this={triggerElement}></button>
<div bind:this={popupElement} data-testid="floating" role="dialog">
  {#if hasTabbableContent}
    <button data-testid="inside" aria-label="inside"></button>
  {/if}
</div>
