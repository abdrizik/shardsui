<script lang="ts">
  import { Drawer, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    swipeDirection = undefined,
    onOpenChange = undefined
  }: {
    swipeDirection?: DrawerSwipeDirection
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Drawer.Root open {swipeDirection} {onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup">
        <button type="button" data-testid="button">Action</button>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
