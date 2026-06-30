<script lang="ts">
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import { TriggerFocusGuards } from '$lib/internal/floating/trigger-focus-guards.svelte'
  import FocusManagerPortal from './focus-manager-portal.svelte'

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let triggerFocusTargetElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let positionerElement = $state<HTMLElement | null>(null)

  const close = () => {
    open = false
  }

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
    onFocusOut: close,
    getPreviousFocusableElement: () => triggerElement,
    getNextFocusableElement: () => triggerFocusTargetElement
  }))

  const guards = new TriggerFocusGuards(() => ({
    close,
    positionerElement,
    popupElement,
    triggerFocusTargetElement,
    triggerElement
  }))
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span tabindex="0" data-testid="first"></span>
{#if open}
  <FocusGuard bind:ref={guards.preFocusGuardElement} onfocus={guards.closeAndFocusBefore} />
{/if}
<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = true)}
></button>
{#if open}
  <FocusGuard bind:ref={triggerFocusTargetElement} onfocus={guards.closeAndFocusAfter} />
  <FocusManagerPortal>
    <div bind:this={positionerElement}>
      <div data-testid="floating" bind:this={popupElement}>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <span tabindex="0" data-testid="inside"></span>
      </div>
    </div>
  </FocusManagerPortal>
{/if}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span tabindex="0" data-testid="last"></span>
