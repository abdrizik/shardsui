<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let {
    handle = undefined,
    open = undefined,
    triggerId = undefined
  }: {
    handle?: PreviewCardHandle<number>
    open?: boolean
    triggerId?: string | null
  } = $props()
</script>

<PreviewCard.Root {handle} {open} {triggerId}>
  {#snippet children({ payload })}
    <PreviewCard.Trigger href="#" id="trigger-1" payload={1} data-testid="trigger-1">
      Trigger 1
    </PreviewCard.Trigger>
    <PreviewCard.Trigger href="#" id="trigger-2" payload={2} data-testid="trigger-2">
      Trigger 2
    </PreviewCard.Trigger>

    <PreviewCard.Portal>
      <PreviewCard.Positioner data-testid="positioner">
        <PreviewCard.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
