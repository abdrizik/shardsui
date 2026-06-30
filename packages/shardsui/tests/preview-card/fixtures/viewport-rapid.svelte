<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
</script>

<PreviewCard.Root>
  {#snippet children({ payload })}
    <PreviewCard.Trigger href="#" payload={1} delay={0} data-testid="trigger1"
      >Trigger 1</PreviewCard.Trigger
    >
    <PreviewCard.Trigger href="#" payload={2} delay={0} data-testid="trigger2"
      >Trigger 2</PreviewCard.Trigger
    >
    <PreviewCard.Trigger href="#" payload={3} delay={0} data-testid="trigger3"
      >Trigger 3</PreviewCard.Trigger
    >
    <PreviewCard.Portal>
      <PreviewCard.Positioner>
        <PreviewCard.Popup>
          <PreviewCard.Viewport>Content {payload}</PreviewCard.Viewport>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
