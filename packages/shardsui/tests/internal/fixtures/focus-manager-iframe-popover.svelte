<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  const close = () => {
    open = false
  }

  dismiss(() => ({
    open,
    onClose: close,
    popupElement,
    isInsideElement: (target) =>
      !!popupElement?.contains(target) || !!triggerElement?.contains(target)
  }))

  manageFocus(() => ({
    open,
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: close
  }))
</script>

<div>
  <!-- svelte-ignore a11y_invalid_attribute -->
  <a href="#">prev iframe link</a>
  <button bind:this={triggerElement} onclick={() => (open = !open)}>Open</button>
  {#if open}
    <div bind:this={popupElement} data-testid="popover">
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#">popover link 1</a>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#">popover link 2</a>
    </div>
  {/if}
  <!-- svelte-ignore a11y_invalid_attribute -->
  <a href="#">next iframe link</a>
</div>
