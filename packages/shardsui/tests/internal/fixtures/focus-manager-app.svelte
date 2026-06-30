<script lang="ts">
  import { untrack } from 'svelte'
  import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    modal?: boolean
    initialFocus?: 'two' | boolean
    finalFocus?: FocusTarget
    closeOnFocusOut?: boolean
    children?: Snippet
  }

  let {
    modal = true,
    initialFocus = undefined,
    finalFocus = undefined,
    closeOnFocusOut = true,
    children
  }: Props = $props()

  let open = $state(false)
  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)
  let two = $state<HTMLButtonElement | null>(null)

  // Reading `two` tracked would re-run initial focus whenever the element changes.
  const focusTwo = () => untrack(() => two)

  manageFocus(() => ({
    open,
    modal,
    enabled: true,
    popupElement,
    triggerElement,
    initialFocus: initialFocus === 'two' ? focusTwo : initialFocus,
    finalFocus,
    closeOnFocusOut,
    onFocusOut: () => {
      open = false
    }
  }))
</script>

<button
  data-testid="reference"
  aria-label="reference"
  bind:this={triggerElement}
  onclick={() => (open = !open)}
></button>
{#if open}
  <div role="dialog" bind:this={popupElement} data-testid="floating">
    <button data-testid="one">close</button>
    <button data-testid="two" bind:this={two}>confirm</button>
    <button data-testid="three" onclick={() => (open = false)}>x</button>
    {@render children?.()}
  </div>
{/if}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div tabindex="0" data-testid="last">outside</div>
