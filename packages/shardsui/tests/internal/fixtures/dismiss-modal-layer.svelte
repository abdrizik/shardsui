<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    testid: string
    modal?: boolean | null
    children?: Snippet
  }

  let { testid, modal = null, children }: Props = $props()

  let open = $state(true)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  dismiss(() => ({
    open,
    onClose: () => {
      open = false
    },
    popupElement,
    isInsideElement: (target) =>
      !!(triggerElement?.contains(target) || popupElement?.contains(target))
  }))

  manageFocus(() => ({
    open,
    modal: modal ?? false,
    enabled: modal !== null,
    popupElement,
    triggerElement,
    initialFocus: undefined,
    finalFocus: undefined,
    closeOnFocusOut: false
  }))
</script>

<button bind:this={triggerElement}>reference</button>
{#if open}
  <div role="dialog" data-testid={testid} bind:this={popupElement}>
    {@render children?.()}
  </div>
{/if}
