<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import FocusManagerPortal from './focus-manager-portal.svelte'

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

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
  data-testid="non-focusable-reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
>
  <button data-testid="open-dialog" aria-label="open-dialog"></button>
</div>
{#if open}
  <FocusManagerPortal>
    <div bind:this={popupElement}>
      <button data-testid="close-dialog" aria-label="close-dialog" onclick={close}></button>
    </div>
  </FocusManagerPortal>
{/if}
