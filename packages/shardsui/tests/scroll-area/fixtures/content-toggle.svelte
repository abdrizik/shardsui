<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let show = $state(false)
</script>

<ScrollArea.Root data-testid="root" style="width: 200px; height: 200px;">
  <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
    {#if show}
      <ScrollArea.Content>
        <div style="width: 1000px; height: 1000px;"></div>
      </ScrollArea.Content>
    {/if}
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <button type="button" onclick={() => (show = true)}>show</button>
</ScrollArea.Root>
