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
    enabled: open,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: close
  }))
</script>

<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
></button>
<div bind:this={popupElement} data-testid="floating">
  <button data-testid="child" aria-label="child"></button>
</div>
<button data-testid="after" aria-label="after"></button>
