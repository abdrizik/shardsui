<script lang="ts">
  import { flushSync } from 'svelte'
  import { ScrollArea } from '$lib/components/scroll-area'

  let { on = 'pointerup' }: { on?: 'pointerup' | 'scroll' } = $props()

  let mounted = $state(true)

  const unmount = () => flushSync(() => (mounted = false))
</script>

<ScrollArea.Root data-testid="root">
  {#if mounted}
    <ScrollArea.Viewport
      data-testid="viewport"
      style="scroll-snap-type: y mandatory;"
      onscroll={on === 'scroll' ? unmount : undefined}
    ></ScrollArea.Viewport>
  {/if}
  <ScrollArea.Scrollbar data-testid="scrollbar" keepMounted>
    <ScrollArea.Thumb data-testid="thumb" onpointerup={on === 'pointerup' ? unmount : undefined} />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
