<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { open = undefined }: { open?: boolean } = $props()
</script>

<PreviewCard.Root {open}>
  <PreviewCard.Trigger href="#">Trigger</PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Positioner>
      <PreviewCard.Popup>
        <PreviewCard.Viewport>
          <div data-testid="content">Content</div>
        </PreviewCard.Viewport>
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
