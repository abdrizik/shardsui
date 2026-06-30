<script lang="ts">
  import { Menubar } from '$lib/components/menubar'
  import { Menu } from '$lib/components/menu'
</script>

<Menubar modal style="display: flex">
  <Menu.Root>
    <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="file-menu" style="width: calc(100vw - 10px)">
        <Menu.Popup>
          <Menu.Item>Open</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <Menu.Root>
    <Menu.Trigger data-testid="edit-trigger">Edit</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="edit-menu" style="width: 240px">
        <Menu.Popup>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
