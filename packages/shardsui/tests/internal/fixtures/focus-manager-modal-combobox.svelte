<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  const close = () => {
    open = false
  }

  manageFocus(() => ({
    open,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: false,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: close
  }))
</script>

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<input
  role="combobox"
  data-testid="input"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
/>
{#if open}
  <div bind:this={popupElement} data-testid="floating">
    <button tabindex="-1">one</button>
  </div>
{/if}
<button data-testid="after" aria-label="after"></button>
