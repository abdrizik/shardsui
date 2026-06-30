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

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<input
  role="combobox"
  data-testid="reference"
  bind:this={triggerElement}
  onfocus={() => (open = true)}
/>
<button data-testid="btn-1" aria-label="btn-1"></button>
<button data-testid="btn-2" aria-label="btn-2"></button>
{#if open}
  <div role="listbox" bind:this={popupElement} data-testid="floating"></div>
{/if}
