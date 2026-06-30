<script lang="ts">
  import { Menubar } from '$lib/components/menubar'
  import { Menu } from '$lib/components/menu'

  let { width = 'calc(100vw - 10px)' }: { width?: string } = $props()
</script>

<Menubar modal style="display: flex">
  <Menu.Root>
    <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="file-menu" style="width: {width}">
        <Menu.Popup>
          <Menu.Item>Open</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
