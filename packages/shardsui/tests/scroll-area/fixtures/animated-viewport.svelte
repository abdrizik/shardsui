<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let { mounted = true }: { mounted?: boolean } = $props()
</script>

<ScrollArea.Root data-testid="root">
  {#if mounted}
    <ScrollArea.Viewport data-testid="viewport"></ScrollArea.Viewport>
  {/if}
  <ScrollArea.Scrollbar orientation="horizontal" keepMounted>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
