<script lang="ts">
  import { ScrollArea } from '$lib/components/scroll-area'
  import { DirectionProvider } from '$lib/components/direction-provider'

  let {
    orientation = 'vertical',
    direction = 'ltr'
  }: {
    orientation?: 'horizontal' | 'vertical'
    direction?: 'ltr' | 'rtl'
  } = $props()
</script>

<DirectionProvider {direction}>
  <ScrollArea.Root style="width: 200px; height: 200px; direction: {direction};">
    <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
      <div
        style="width: {orientation === 'horizontal' ? '1000px' : '100%'}; height: {orientation ===
        'vertical'
          ? '1000px'
          : '100%'};"
      ></div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar {orientation} data-testid="scrollbar" keepMounted>
      <ScrollArea.Thumb data-testid="thumb" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
</DirectionProvider>
