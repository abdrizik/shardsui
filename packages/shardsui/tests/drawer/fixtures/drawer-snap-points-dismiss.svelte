<script lang="ts">
  import { Drawer, type DrawerSnapPoint, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    snapPoints,
    swipeDirection = 'down',
    onOpenChange
  }: {
    snapPoints: DrawerSnapPoint[]
    swipeDirection?: DrawerSwipeDirection
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Drawer.Root open {snapPoints} {swipeDirection} {onOpenChange}>
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup" style="height: 0; padding: 0; border: 0; overflow: hidden">
        Drawer
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
