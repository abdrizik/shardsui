<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Dialog } from '$lib/components/dialog'

  const dialogHandle = new Dialog.Handle()
</script>

<Menu.Root>
  <Menu.Trigger>Open menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>
          <Dialog.Trigger handle={dialogHandle}>Open dialog</Dialog.Trigger>
        </Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

<Dialog.Root handle={dialogHandle}>
  <Dialog.Portal>
    <Dialog.Popup>Dialog content</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
