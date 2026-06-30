<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<Drawer.Root
  open
  modal={false}
  swipeDirection="up"
  snapPoints={['100px', '300px']}
  snapPoint="100px"
>
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport" style="height: 400px">
      <Drawer.Popup data-testid="popup" style="height: 300px">Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
