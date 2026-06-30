<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'
  import PreviewCardOpenOnMount from './preview-card-open-on-mount.svelte'

  let {
    handle,
    phase = 'outgoing',
    onOpenError
  }: {
    handle: PreviewCardHandle
    phase?: 'outgoing' | 'overlap' | 'incoming'
    onOpenError?: (error: unknown) => void
  } = $props()
</script>

<PreviewCard.Trigger {handle} href="#" id="trigger" data-testid="trigger"
  >Trigger</PreviewCard.Trigger
>

{#if phase === 'outgoing' || phase === 'overlap'}
  {#key 'outgoing'}
    <PreviewCard.Root {handle}>
      <PreviewCard.Portal>
        <PreviewCard.Positioner>
          <PreviewCard.Popup>Outgoing</PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  {/key}
{/if}

{#if phase === 'overlap' || phase === 'incoming'}
  {#key 'incoming'}
    <PreviewCard.Root {handle}>
      <PreviewCard.Portal>
        <PreviewCard.Positioner>
          <PreviewCard.Popup>Incoming</PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  {/key}
  <PreviewCardOpenOnMount {handle} triggerId="trigger" onError={onOpenError} />
{/if}
