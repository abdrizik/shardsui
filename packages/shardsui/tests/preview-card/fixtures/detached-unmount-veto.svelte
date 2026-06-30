<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let { handle }: { handle: PreviewCardHandle<number> } = $props()

  let open = $state(true)
  let showFirstTrigger = $state(true)
</script>

<div style="padding: 50px;">
  <button data-testid="remove-first" onclick={() => (showFirstTrigger = false)}>remove</button>

  <div style="display: flex; gap: 120px;">
    {#if showFirstTrigger}
      <PreviewCard.Trigger
        {handle}
        href="#"
        id="trigger-1"
        payload={1}
        delay={0}
        data-testid="trigger-1"
      >
        Trigger 1
      </PreviewCard.Trigger>
    {/if}
    <PreviewCard.Trigger
      {handle}
      href="#"
      id="trigger-2"
      payload={2}
      delay={0}
      data-testid="trigger-2"
    >
      Trigger 2
    </PreviewCard.Trigger>
  </div>

  <PreviewCard.Root
    {handle}
    bind:open={
      () => open,
      (next) => {
        if (next) open = true
      }
    }
    triggerId="trigger-1"
  >
    {#snippet children({ payload })}
      <PreviewCard.Portal>
        <PreviewCard.Positioner side="bottom" align="start">
          <PreviewCard.Popup data-testid="popup">
            <span data-testid="content">{payload}</span>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    {/snippet}
  </PreviewCard.Root>
</div>
