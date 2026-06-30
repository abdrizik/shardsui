<script lang="ts">
  import { Drawer, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    disabled = false,
    swipeDirection = undefined,
    includePopup = false,
    onOpenChange = undefined
  }: {
    disabled?: boolean
    swipeDirection?: DrawerSwipeDirection
    includePopup?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Drawer.Root {onOpenChange}>
  <Drawer.SwipeArea data-testid="swipe-area" {disabled} {swipeDirection} />
  {#if includePopup}
    <Drawer.Portal>
      <Drawer.Viewport>
        <Drawer.Popup data-testid="popup">Drawer</Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  {/if}
</Drawer.Root>
