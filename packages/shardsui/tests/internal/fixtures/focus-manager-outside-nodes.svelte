<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let { modal = true, floatingRole = undefined }: { modal?: boolean; floatingRole?: string } =
    $props()

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined
  }))
</script>

<input data-testid="reference" bind:this={triggerElement} onclick={() => (open = !open)} />
<div data-testid="outside-wrapper">
  <div data-testid="aria-live" aria-live="polite"></div>
  <button data-testid="btn-1" aria-label="btn-1"></button>
  <button data-testid="btn-2" aria-label="btn-2"></button>
</div>
{#if open}
  <div role={floatingRole} bind:this={popupElement} data-testid="floating"></div>
{/if}
