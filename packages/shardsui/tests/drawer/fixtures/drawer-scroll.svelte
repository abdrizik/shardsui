<script lang="ts">
  import { Drawer, type DrawerSwipeDirection, type DrawerSnapPoint } from '$lib/components/drawer'

  let {
    swipeDirection = 'down',
    axis = 'y',
    snapPoints = undefined,
    onOpenChange = undefined
  }: {
    swipeDirection?: DrawerSwipeDirection
    axis?: 'y' | 'x' | 'both'
    snapPoints?: DrawerSnapPoint[]
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Drawer.Root open {swipeDirection} {snapPoints} {onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport>
      <Drawer.Popup data-testid="popup">
        {#if axis === 'x'}
          <div data-testid="scroll" style="overflow-x: auto; max-width: 40px;">
            <div style="width: 120px; height: 40px;">Scrollable content</div>
          </div>
        {:else if axis === 'both'}
          <div data-testid="scroll" style="overflow: auto; width: 40px; height: 40px;">
            <div style="width: 120px; height: 120px;">Scrollable content</div>
          </div>
        {:else}
          <div data-testid="scroll" style="overflow-y: auto; max-height: 40px;">
            <div style="height: 120px;">Scrollable content</div>
          </div>
        {/if}
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
