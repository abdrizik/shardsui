<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let {
    handle,
    open = undefined,
    triggerId = undefined,
    onOpenChange = undefined
  }: {
    handle: PreviewCardHandle<number>
    open?: boolean
    triggerId?: string | null
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<PreviewCard.Root {handle} {open} {triggerId} {onOpenChange}>
  {#snippet children({ payload })}
    <PreviewCard.Portal>
      <PreviewCard.Positioner data-testid="positioner">
        <PreviewCard.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>

<PreviewCard.Trigger {handle} href="#" id="trigger" payload={1} data-testid="trigger">
  Trigger
</PreviewCard.Trigger>
