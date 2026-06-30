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
    modal: true,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: close
  }))
</script>

<div>
  <input
    role="combobox"
    aria-expanded={open}
    aria-controls={open ? 'floating' : undefined}
    data-testid="input"
    bind:this={triggerElement}
    onclick={() => (open = !open)}
  />
  {#if open}
    <div id="floating" role="listbox" tabindex="-1" bind:this={popupElement}>
      <button>one</button>
      <button>two</button>
    </div>
  {/if}
</div>
