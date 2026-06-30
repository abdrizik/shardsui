<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  let { open = false, onOpenChange = undefined, delay = 0, closeDelay = 0 } = $props()
</script>

<PreviewCard.Root {open} {onOpenChange}>
  <PreviewCard.Trigger href="#" {delay} {closeDelay} data-testid="trigger"
    >Hover me</PreviewCard.Trigger
  >
  <PreviewCard.Portal>
    <PreviewCard.Positioner data-testid="positioner">
      <PreviewCard.Popup data-testid="popup">Card content</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
