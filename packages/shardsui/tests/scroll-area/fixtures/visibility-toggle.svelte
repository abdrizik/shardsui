<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'

  let visible = $state(false)
</script>

<button type="button" onclick={() => (visible = true)}>show</button>
<div style="display: {visible ? 'block' : 'none'};">
  <ScrollArea.Root style="width: 200px; height: 200px;">
    <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
      <div style="width: 1000px; height: 1000px;"></div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="vertical" style="display: flex;">
      <ScrollArea.Thumb data-testid="vertical-thumb" style="padding-block: 8px;" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
</div>
