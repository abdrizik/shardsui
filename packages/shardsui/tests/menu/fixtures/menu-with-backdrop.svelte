<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { openOnHover = false, delay = 0 } = $props()
</script>

<Menu.Root>
  <Menu.Trigger {openOnHover} {delay}>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Backdrop data-testid="backdrop" />
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
