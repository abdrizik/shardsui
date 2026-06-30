<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
  import { DirectionProvider } from '$lib/components/direction-provider'

  let { direction = 'ltr' }: { direction?: 'ltr' | 'rtl' } = $props()
</script>

<DirectionProvider {direction}>
  <ScrollArea.Root style="width: 200px; height: 200px; direction: {direction};">
    <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
      <div style="width: 1000px; height: 200px;"></div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar
      orientation="horizontal"
      data-testid="scrollbar"
      keepMounted
      style="display: flex; width: 200px; height: 10px;"
    >
      <ScrollArea.Thumb data-testid="thumb" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
</DirectionProvider>
