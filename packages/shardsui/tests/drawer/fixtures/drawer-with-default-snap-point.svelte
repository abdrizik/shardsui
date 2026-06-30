<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import DrawerActiveSnapDisplay from './drawer-active-snap-display.svelte'

  const snapPoints = ['100px', '300px', 1] as const
  let open = $state(true)
</script>

<Drawer.Root bind:open snapPoint={snapPoints[1]} snapPoints={[...snapPoints]}>
  <DrawerActiveSnapDisplay />
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup">
        Drawer
        <Drawer.Close data-testid="close">Close</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
