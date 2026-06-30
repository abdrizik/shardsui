<script lang="ts">
  import { Drawer, type DrawerSnapPoint } from '$lib/components/drawer'
  import DrawerSnapPointProbe from './drawer-snap-point-probe.svelte'

  let {
    snapPoints,
    snapPoint,
    popupHeight = 300,
    viewportHeight = 400
  }: {
    snapPoints: DrawerSnapPoint[]
    snapPoint?: DrawerSnapPoint | null
    popupHeight?: number
    viewportHeight?: number
  } = $props()
</script>

<Drawer.Root open modal={false} {snapPoints} {snapPoint}>
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport" style="height: {viewportHeight}px">
      <DrawerSnapPointProbe />
      <Drawer.Popup data-testid="popup" style="height: {popupHeight}px">Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
