<script lang="ts">
  import { Drawer, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    swipeDirection = 'down',
    mode = 'controlled',
    viewportHeight = 300,
    popupHeight = 200,
    onOpenChange = undefined
  }: {
    swipeDirection?: DrawerSwipeDirection
    mode?: 'controlled' | 'alwaysOpen'
    viewportHeight?: number
    popupHeight?: number
    onOpenChange?: (open: boolean) => void
  } = $props()

  let open = $state(true)
</script>

<Drawer.Root
  bind:open={
    () => (mode === 'alwaysOpen' ? true : open),
    (next) => {
      onOpenChange?.(next)
      if (mode === 'alwaysOpen') return
      open = next
    }
  }
  {swipeDirection}
>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport" style="height: {viewportHeight}px;">
      <Drawer.Popup data-testid="popup" style="height: {popupHeight}px;">Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
