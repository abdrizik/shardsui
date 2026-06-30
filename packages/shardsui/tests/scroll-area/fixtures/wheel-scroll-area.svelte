<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
  import { DirectionProvider } from '$lib/components/direction-provider'

  let {
    direction = 'ltr',
    orientation = 'horizontal'
  }: {
    direction?: 'ltr' | 'rtl'
    orientation?: 'horizontal' | 'vertical'
  } = $props()
</script>

<DirectionProvider {direction}>
  <ScrollArea.Root style="width: 200px; height: 200px; direction: {direction};">
    <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
      <div style="width: 1000px; height: 1000px;"></div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar {orientation} data-testid="scrollbar" keepMounted />
  </ScrollArea.Root>
</DirectionProvider>
