<script lang="ts">
  import { flushSync } from 'svelte'
  import { ScrollArea } from '$lib/components/scroll-area'

  let mounted = $state(true)
</script>

<ScrollArea.Root data-testid="root">
  <ScrollArea.Viewport data-testid="viewport"></ScrollArea.Viewport>
  {#if mounted}
    <ScrollArea.Scrollbar data-testid="scrollbar" keepMounted>
      <ScrollArea.Thumb
        data-testid="thumb"
        onpointermove={() => flushSync(() => (mounted = false))}
      />
    </ScrollArea.Scrollbar>
  {/if}
</ScrollArea.Root>
