<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let open = $state(true)
</script>

<Drawer.Root
  bind:open={
    () => open,
    (next) => {
      if (!next) return
      open = next
    }
  }
  swipeDirection="down"
>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport" style="height: 300px;">
      <Drawer.Popup data-testid="popup" style="height: 200px;">Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
