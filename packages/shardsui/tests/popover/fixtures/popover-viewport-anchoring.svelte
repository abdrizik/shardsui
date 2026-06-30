<script lang="ts">
  import { DirectionProvider } from '$lib/components/direction-provider'
  import { Popover } from '$lib/components/popover'
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'

  let { side = 'bottom', direction = 'ltr' }: { side?: Side; direction?: 'ltr' | 'rtl' } = $props()
</script>

<DirectionProvider {direction}>
  <Popover.Root open>
    <Popover.Trigger data-testid="trigger">Trigger</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner {side} collisionAvoidance={{ side: 'none' }}>
        <Popover.Popup data-testid="popup">
          <Popover.Viewport>Content</Popover.Viewport>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</DirectionProvider>
