<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let {
    shape = 'contained',
    open = $bindable(false),
    onOpenChange = undefined,
    onOpenChangeComplete = undefined,
    delay = 0,
    closeDelay = 0,
    popupClass = undefined
  }: {
    shape?: 'contained' | 'detached' | 'multiple-detached'
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    delay?: number
    closeDelay?: number
    popupClass?: string
  } = $props()

  const handle = new PreviewCard.Handle()
</script>

{#snippet portal()}
  <PreviewCard.Portal>
    <PreviewCard.Positioner data-testid="positioner">
      <PreviewCard.Popup data-testid="popup" class={popupClass}>Content</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
{/snippet}

<button type="button" onclick={() => (open = true)}>Open</button>
<button type="button" onclick={() => (open = false)}>Close</button>

{#if shape === 'contained'}
  <PreviewCard.Root bind:open {onOpenChange} {onOpenChangeComplete}>
    <PreviewCard.Trigger href="#" {delay} {closeDelay} data-testid="trigger"
      >Link</PreviewCard.Trigger
    >
    {@render portal()}
  </PreviewCard.Root>
{:else}
  <PreviewCard.Trigger {handle} href="#" {delay} {closeDelay} data-testid="trigger"
    >Link</PreviewCard.Trigger
  >
  {#if shape === 'multiple-detached'}
    <PreviewCard.Trigger {handle} href="#" data-testid="trigger-2">Another link</PreviewCard.Trigger
    >
  {/if}
  <PreviewCard.Root {handle} bind:open {onOpenChange} {onOpenChangeComplete}>
    {@render portal()}
  </PreviewCard.Root>
{/if}
