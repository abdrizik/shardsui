<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let height = $state(50)
</script>

<ScrollArea.Root data-testid="root" style="width: 200px; height: 200px;">
  <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
    <ScrollArea.Content data-testid="content">
      <div style="width: 50px; height: {height}px;"></div>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <button type="button" onclick={() => (height = 1000)}>grow</button>
</ScrollArea.Root>
