<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import FocusManagerPortal from './focus-manager-portal.svelte'

  let { modal = true }: { modal?: boolean } = $props()

  let open = $state(false)
  let removed = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: () => {
      open = false
    }
  }))
</script>

{#if !removed}
  <button
    data-testid="reference"
    aria-label="reference"
    bind:this={triggerElement}
    onclick={() => (open = !open)}
  ></button>
{/if}
{#if open}
  <FocusManagerPortal>
    <div bind:this={popupElement}>
      <button
        data-testid="remove"
        onclick={() => {
          removed = true
          open = false
        }}>remove</button
      >
    </div>
  </FocusManagerPortal>
{/if}
<button data-testid="fallback" aria-label="fallback"></button>
