<script lang="ts">
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'

  let {
    initialFocus = undefined,
    floatingRole = 'dialog'
  }: { initialFocus?: boolean; floatingRole?: string } = $props()

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  manageFocus(() => ({
    open,
    modal: false,
    enabled: true,
    popupElement,
    triggerElement,
    openMethod: 'mouse',
    initialFocus,
    finalFocus: undefined,
    closeOnFocusOut: true,
    onFocusOut: () => {
      open = false
    }
  }))
</script>

<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = true)}
></button>
{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    bind:this={popupElement}
    data-testid="floating"
    role={floatingRole}
    tabindex={floatingRole === 'listbox' ? -1 : undefined}
  ></div>
{/if}
