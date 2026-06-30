<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let { handle }: { handle: PreviewCardHandle<number> } = $props()
</script>

<div style="margin: 50px;">
  <PreviewCard.Trigger
    {handle}
    href="#"
    id="trigger-1"
    payload={1}
    delay={0}
    closeDelay={0}
    data-testid="trigger1"
  >
    Trigger 1
  </PreviewCard.Trigger>
  <PreviewCard.Trigger
    {handle}
    href="#"
    id="trigger-2"
    payload={2}
    delay={0}
    closeDelay={0}
    data-testid="trigger2"
  >
    Trigger 2
  </PreviewCard.Trigger>

  <PreviewCard.Root {handle}>
    <PreviewCard.Portal keepMounted>
      <PreviewCard.Positioner data-testid="positioner" side="bottom" align="start">
        <PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
</div>
