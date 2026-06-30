<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let { handle, rootMounted = true }: { handle: PreviewCardHandle<number>; rootMounted?: boolean } =
    $props()
</script>

<PreviewCard.Trigger {handle} href="#" id="trigger" payload={1} data-testid="trigger">
  Trigger
</PreviewCard.Trigger>

{#if rootMounted}
  <PreviewCard.Root {handle}>
    {#snippet children({ payload })}
      <span data-testid="payload">{payload ?? 'No payload'}</span>
      <PreviewCard.Portal>
        <PreviewCard.Positioner>
          <PreviewCard.Popup data-testid="popup">Preview Card Content</PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    {/snippet}
  </PreviewCard.Root>
{/if}
