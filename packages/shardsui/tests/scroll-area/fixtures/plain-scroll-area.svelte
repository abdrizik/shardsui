<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let { viewportStyle = '' }: { viewportStyle?: string } = $props()
</script>

<ScrollArea.Root data-testid="root" style="width: 200px; height: 200px;">
  <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%; {viewportStyle}">
    <div style="width: 1000px; height: 1000px;"></div>
  </ScrollArea.Viewport>
</ScrollArea.Root>
