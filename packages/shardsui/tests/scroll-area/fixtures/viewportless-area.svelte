<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
</script>

<ScrollArea.Root data-testid="root">
  <ScrollArea.Scrollbar data-testid="scrollbar" keepMounted>
    <ScrollArea.Thumb data-testid="thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
