<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let open = $state(false)
</script>

<PreviewCard.Root
  bind:open={
    () => open,
    (next) => {
      if (!next) open = false
    }
  }
>
  <PreviewCard.Trigger href="#" delay={0} closeDelay={0} data-testid="trigger"
    >Hover me</PreviewCard.Trigger
  >
  <PreviewCard.Portal>
    <PreviewCard.Positioner data-testid="positioner">
      <PreviewCard.Popup data-testid="popup">Card content</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
