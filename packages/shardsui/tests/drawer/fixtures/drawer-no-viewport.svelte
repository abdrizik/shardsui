<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let { open = true } = $props()
</script>

<Drawer.Root {open}>
  <Drawer.Portal>
    <Drawer.Popup>
      <Drawer.Title>Drawer title</Drawer.Title>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>
