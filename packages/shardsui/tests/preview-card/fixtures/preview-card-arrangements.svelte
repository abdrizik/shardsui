<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let {
    arrangement = 'contained',
    open = $bindable(false),
    onOpenChange,
    onOpenChangeComplete,
    delay = 0,
    closeDelay = 0,
    popupClass
  }: {
    arrangement?: 'contained' | 'detached' | 'multiple-detached'
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

{#if arrangement === 'contained'}
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
  {#if arrangement === 'multiple-detached'}
    <PreviewCard.Trigger {handle} href="#" data-testid="trigger-2">Another link</PreviewCard.Trigger
    >
  {/if}
  <PreviewCard.Root {handle} bind:open {onOpenChange} {onOpenChangeComplete}>
    {@render portal()}
  </PreviewCard.Root>
{/if}
