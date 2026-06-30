<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined
  }))
</script>

<button
  aria-label="reference"
  bind:this={triggerElement}
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-controls={open ? 'floating' : undefined}
  onclick={() => (open = !open)}
></button>
{#if open}
  <div bind:this={popupElement} data-testid="outer">
    <div id="floating" role="dialog" data-shards-ui-focusable data-testid="inner"></div>
  </div>
{/if}
