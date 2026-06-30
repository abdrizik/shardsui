<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { open = undefined }: { open?: boolean } = $props()
</script>

<PreviewCard.Root {open}>
  <PreviewCard.Trigger href="#" delay={0} closeDelay={0} data-testid="trigger">
    Hover me
  </PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Positioner>
      <PreviewCard.Popup data-testid="popup">Card content</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
