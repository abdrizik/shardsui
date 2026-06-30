<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { withViewport = false }: { withViewport?: boolean } = $props()
</script>

<PreviewCard.Root open>
  <PreviewCard.Trigger as="div" style="width: 72px; height: 36px;">Trigger</PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Positioner data-testid="positioner">
      <PreviewCard.Popup style="width: 52px; height: 24px;">
        {#if withViewport}
          <PreviewCard.Viewport>Popup</PreviewCard.Viewport>
        {:else}
          Popup
        {/if}
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
