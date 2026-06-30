<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { open = false, delay = 0, closeDelay = 0 } = $props()
</script>

<PreviewCard.Root {open}>
  <PreviewCard.Trigger {delay} {closeDelay} data-testid="trigger">Hover me</PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Backdrop data-testid="backdrop" />
    <PreviewCard.Positioner data-testid="positioner">
      <PreviewCard.Popup data-testid="popup">Card content</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
