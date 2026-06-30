<script lang="ts">
  import { dismiss, type DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import { attachFloatingNode } from '$lib/internal/floating/floating-tree.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    testid: string
    outsidePress?: boolean
    bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean }
    onDismiss?: (reason: DismissReason, event: Event) => void
    children?: Snippet
  }

  let {
    testid,
    outsidePress = true,
    bubbles = undefined,
    onDismiss = undefined,
    children
  }: Props = $props()

  let open = $state(true)
  let popupElement = $state<HTMLElement | null>(null)

  const { tree, nodeId } = attachFloatingNode({
    open: () => open,
    floating: () => popupElement
  })

  dismiss(() => ({
    open,
    onClose: (reason, event) => {
      onDismiss?.(reason, event)
      open = false
    },
    outsidePress,
    bubbles,
    tree,
    nodeId,
    popupElement,
    isInsideElement: (target) => !!popupElement?.contains(target)
  }))
</script>

{#if open}
  <div data-testid={testid} bind:this={popupElement} role="dialog">
    {@render children?.()}
  </div>
{/if}
