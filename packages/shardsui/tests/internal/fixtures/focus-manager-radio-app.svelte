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
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
></button>
{#if open}
  <div role="dialog" bind:this={popupElement}>
    <input type="radio" name="group" data-testid="radio-one" />
    <input type="radio" name="group" checked data-testid="radio-two" />
    <button data-testid="after-radio">after</button>
  </div>
{/if}
