<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { portalTo } from '$lib/internal/floating/portal'
  import type { Snippet } from 'svelte'

  type Props = {
    triggerText: string
    container?: HTMLElement | null
    children?: Snippet
  }

  let { triggerText, container = null, children }: Props = $props()

  let open = $state(false)
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
</script>

<button bind:this={triggerElement} onclick={() => (open = !open)}>{triggerText}</button>
{#if open}
  <div data-shards-ui-portal {@attach portalTo(container)}>
    <div bind:this={popupElement}>
      {@render children?.()}
    </div>
  </div>
{/if}
