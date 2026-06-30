<script lang="ts" module>
  import type { DrawerSnapPoint } from '$lib/components/drawer'

  const snapPoints: DrawerSnapPoint[] = ['100px', '300px', 1]
</script>

<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let open = $state(true)
  let snapPoint = $state<DrawerSnapPoint | null>(snapPoints[2])
</script>

<div>
  <div data-testid="active-snap">{String(snapPoint)}</div>
  <Drawer.Root
    bind:open={
      () => open,
      (next) => {
        if (!next) return
        open = next
      }
    }
    snapPoints={[...snapPoints]}
    bind:snapPoint
  >
    <Drawer.Portal>
      <Drawer.Viewport data-testid="viewport">
        <Drawer.Popup data-testid="popup">
          Drawer
          <Drawer.Close data-testid="close">Close</Drawer.Close>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
</div>
