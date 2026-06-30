<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1" style="display: none">Item 1</Menu.Item>
        <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        <Menu.Item data-testid="item-3">Item 3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
