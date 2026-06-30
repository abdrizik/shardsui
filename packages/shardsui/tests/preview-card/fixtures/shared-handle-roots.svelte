<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let { handle }: { handle: PreviewCardHandle } = $props()
</script>

<PreviewCard.Root {handle}>
  <PreviewCard.Portal>
    <PreviewCard.Positioner>
      <PreviewCard.Popup>First</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>

<PreviewCard.Root {handle}>
  <PreviewCard.Portal>
    <PreviewCard.Positioner>
      <PreviewCard.Popup>Second</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
