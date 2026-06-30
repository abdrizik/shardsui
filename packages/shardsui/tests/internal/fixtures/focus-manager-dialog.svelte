<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { attachFloatingNode } from '$lib/internal/floating/floating-tree.svelte'
  import { manageFocus } from '$lib/internal/floating/focus-manager.svelte'
  import type { Snippet } from 'svelte'
  import FocusManagerPortal from './focus-manager-portal.svelte'

  type Props = {
    open?: boolean
    modal?: boolean
    triggerTestid?: string
    children?: Snippet<[() => void]>
    sideChildren?: Snippet
  }

  let {
    open: controlledOpen = undefined,
    modal = true,
    triggerTestid = undefined,
    children,
    sideChildren = undefined
  }: Props = $props()

  let internalOpen = $state(false)
  const open = $derived(controlledOpen !== undefined ? controlledOpen : internalOpen)

  let triggerElement = $state<HTMLElement | null>(null)
  let popupElement = $state<HTMLElement | null>(null)

  const { tree, nodeId } = attachFloatingNode({
    open: () => open,
    floating: () => popupElement
  })

  const close = () => {
    internalOpen = false
  }
  const toggle = () => {
    internalOpen = !internalOpen
  }

  dismiss(() => ({
    open,
    onClose: close,
    bubbles: false,
    tree,
    nodeId,
    popupElement,
    isInsideElement: (target) =>
      !!popupElement?.contains(target) || !!triggerElement?.contains(target)
  }))

  manageFocus(() => ({
    open,
    modal,
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

{#if triggerTestid}
  <button
    aria-label="reference"
    data-testid={triggerTestid}
    bind:this={triggerElement}
    onclick={toggle}
  ></button>
{/if}
{#if open}
  <FocusManagerPortal>
    <div bind:this={popupElement}>
      {@render children?.(close)}
    </div>
  </FocusManagerPortal>
{/if}
{@render sideChildren?.()}
