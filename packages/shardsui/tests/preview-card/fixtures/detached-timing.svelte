<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let {
    handle,
    delay1 = 0,
    delay2 = undefined
  }: {
    handle: PreviewCardHandle<number>
    delay1?: number
    delay2?: number
  } = $props()
</script>

<button type="button" aria-label="Initial focus"></button>

<PreviewCard.Trigger
  {handle}
  href="#"
  id="trigger-1"
  payload={1}
  delay={delay1}
  data-testid="trigger1"
>
  Trigger 1
</PreviewCard.Trigger>
{#if delay2 !== undefined}
  <PreviewCard.Trigger
    {handle}
    href="#"
    id="trigger-2"
    payload={2}
    delay={delay2}
    data-testid="trigger2"
  >
    Trigger 2
  </PreviewCard.Trigger>
{/if}

<PreviewCard.Root {handle}>
  {#snippet children({ payload })}
    <PreviewCard.Portal keepMounted>
      <PreviewCard.Positioner>
        <PreviewCard.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
