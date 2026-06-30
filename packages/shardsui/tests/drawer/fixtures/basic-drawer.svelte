<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let { open = undefined, modal = true, onOpenChange = undefined } = $props()
</script>

<Drawer.Root {open} {modal} {onOpenChange}>
  <Drawer.Trigger>Open Drawer</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Title>Drawer title</Drawer.Title>
        <Drawer.Description>Drawer description</Drawer.Description>
        <Drawer.Close>Close</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
