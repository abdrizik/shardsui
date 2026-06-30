<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<Drawer.Root modal={false}>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup initialFocus={false}>Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
