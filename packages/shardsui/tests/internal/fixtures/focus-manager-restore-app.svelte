<script lang="ts">
  import { untrack } from 'svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let { restoreFocus = true }: { restoreFocus?: boolean } = $props()

  let open = $state(false)
  let removed = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let two = $state<HTMLButtonElement | null>(null)

  // Reading `two` tracked would re-run initial focus when it is removed, re-focusing the popup's
  // first tabbable instead of letting focus fall where the restoreFocus option decides.
  const focusTwo = () => untrack(() => two)

  manageFocus(() => ({
    open,
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: focusTwo,
    finalFocus: undefined,
    restoreFocus
  }))
</script>

<button onclick={() => (removed = true)}>remove</button>
<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
></button>
{#if open}
  <div bind:this={popupElement} data-testid="floating">
    <button>one</button>
    {#if !removed}
      <button bind:this={two}>two</button>
    {/if}
    <button>three</button>
  </div>
{/if}
