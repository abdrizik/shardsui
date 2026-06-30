<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let { showFirstTrigger = true }: { showFirstTrigger?: boolean } = $props()
</script>

<PreviewCard.Root open triggerId="trigger-1">
  {#snippet children({ payload })}
    <button type="button" aria-label="Initial focus"></button>
    {#if showFirstTrigger}
      <PreviewCard.Trigger href="#" id="trigger-1" payload={1} delay={0} data-testid="trigger-1">
        Trigger 1
      </PreviewCard.Trigger>
    {/if}
    <PreviewCard.Trigger href="#" id="trigger-2" payload={2} delay={0} data-testid="trigger-2">
      Trigger 2
    </PreviewCard.Trigger>

    <PreviewCard.Portal>
      <PreviewCard.Positioner side="bottom" align="start">
        <PreviewCard.Popup>
          <span data-testid="content">{payload}</span>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
