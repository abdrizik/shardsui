<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { portalTo } from '$lib/internal/floating/portal'

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
</script>

<button bind:this={triggerElement}>reference</button>
{#if open}
  <div role="tooltip" bind:this={popupElement}>
    <div data-shards-ui-portal {@attach portalTo(null)}>
      <button data-testid="portaled-button">portaled</button>
    </div>
  </div>
{/if}
