<script lang="ts">
  import { untrack } from 'svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let {
    disabled: initialDisabled = true,
    floatingRole = 'dialog'
  }: { disabled?: boolean; floatingRole?: string } = $props()

  let open = $state(false)
  let disabled = $state(untrack(() => initialDisabled))
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: true,
    enabled: !disabled,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined
  }))
</script>

<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
></button>
<button data-testid="toggle" aria-label="toggle" onclick={() => (disabled = !disabled)}></button>
{#if open}
  <div bind:this={popupElement} data-testid="floating" role={floatingRole}></div>
{/if}
