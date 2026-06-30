<script lang="ts">
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'

  let popoverOpen = $state(true)
  let tooltipOpen = $state(false)

  let popoverTrigger = $state<HTMLElement | null>(null)
  let popoverPopup = $state<HTMLElement | null>(null)
  let focusButton = $state<HTMLElement | null>(null)
  let tooltipPopup = $state<HTMLElement | null>(null)

  dismiss(() => ({
    open: popoverOpen,
    onClose: () => {
      popoverOpen = false
    },
    popupElement: popoverPopup,
    isInsideElement: (target) =>
      !!(popoverTrigger?.contains(target) || popoverPopup?.contains(target))
  }))

  dismiss(() => ({
    open: tooltipOpen,
    onClose: () => {
      tooltipOpen = false
    },
    popupElement: tooltipPopup,
    referenceElement: focusButton,
    isInsideElement: (target) => !!(focusButton?.contains(target) || tooltipPopup?.contains(target))
  }))
</script>

<button bind:this={popoverTrigger}>reference</button>
{#if popoverOpen}
  <div role="dialog" data-testid="popover" bind:this={popoverPopup}>
    <button
      data-testid="focus-button"
      bind:this={focusButton}
      onfocus={() => (tooltipOpen = true)}
      onblur={() => (tooltipOpen = false)}
    >
      focus
    </button>
  </div>
{/if}
{#if tooltipOpen}
  <div role="tooltip" data-testid="tooltip" bind:this={tooltipPopup}></div>
{/if}
