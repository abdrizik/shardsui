<script lang="ts">
  import { Drawer, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    swipeDirection = undefined,
    onOpenChange = undefined,
    onTargetClick = undefined,
    swipeIgnore = false
  }: {
    swipeDirection?: DrawerSwipeDirection
    onOpenChange?: (open: boolean) => void
    onTargetClick?: () => void
    swipeIgnore?: boolean
  } = $props()
</script>

<Drawer.Root open {swipeDirection} {onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup">
        <Drawer.Content>
          <div
            data-testid="target"
            data-shards-ui-swipe-ignore={swipeIgnore ? '' : undefined}
            onclick={onTargetClick}
            role="presentation"
          >
            <span data-testid="text">Selectable</span>
          </div>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
