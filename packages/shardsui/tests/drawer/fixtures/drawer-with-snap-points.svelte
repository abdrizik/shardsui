<script lang="ts">
  import { Drawer, type DrawerSnapPoint } from '$lib/components/drawer'

  const snapPoints = ['100px', '300px', 1] as const

  let open = $state(true)
  let snapPoint = $state<DrawerSnapPoint | null>(snapPoints[0])
</script>

<div data-testid="active-snap">{String(snapPoint)}</div>
<button data-testid="expand" onclick={() => (snapPoint = 1)}>Expand</button>

<Drawer.Root bind:open bind:snapPoint snapPoints={[...snapPoints]}>
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup">
        Drawer
        <Drawer.Close data-testid="close">Close</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
