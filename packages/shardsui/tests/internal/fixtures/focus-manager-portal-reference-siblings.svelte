<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import FocusManagerPortal from './focus-manager-portal.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: () => {
      open = false
    },
    getPreviousFocusableElement: () => triggerElement,
    getNextFocusableElement: () => null
  }))
</script>

<div data-testid="reference-wrapper">
  <button
    data-testid="reference"
    aria-label="reference"
    bind:this={triggerElement}
    onclick={() => (open = true)}
  ></button>
  <span data-testid="reference-sibling-1"></span>
  <span data-testid="reference-sibling-2"></span>
</div>
{#if open}
  <FocusManagerPortal>
    <div data-testid="floating" bind:this={popupElement}>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <span tabindex="0" data-testid="inside"></span>
    </div>
  </FocusManagerPortal>
{/if}
