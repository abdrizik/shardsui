<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { delay2 = 0 }: { delay2?: number } = $props()
</script>

<PreviewCard.Root>
  {#snippet children({ payload })}
    <button type="button" aria-label="Initial focus"></button>
    <PreviewCard.Trigger href="#" payload={1} delay={0} data-testid="trigger1"
      >Trigger 1</PreviewCard.Trigger
    >
    <PreviewCard.Trigger href="#" payload={2} delay={delay2} data-testid="trigger2"
      >Trigger 2</PreviewCard.Trigger
    >
    <PreviewCard.Trigger href="#" payload={3} delay={0} data-testid="trigger3"
      >Trigger 3</PreviewCard.Trigger
    >

    <PreviewCard.Portal>
      <PreviewCard.Positioner data-testid="positioner">
        <PreviewCard.Popup data-testid="popup">
          <span data-testid="content">{payload ?? ''}</span>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
