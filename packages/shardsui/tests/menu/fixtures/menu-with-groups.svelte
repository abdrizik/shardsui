<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Group data-testid="group-1">
          <Menu.GroupLabel data-testid="group-label-1">Group 1</Menu.GroupLabel>
          <Menu.Item data-testid="group1-item-1">Item 1.1</Menu.Item>
          <Menu.Item data-testid="group1-item-2">Item 1.2</Menu.Item>
        </Menu.Group>
        <Menu.Group data-testid="group-2">
          <Menu.GroupLabel data-testid="group-label-2">Group 2</Menu.GroupLabel>
          <Menu.Item data-testid="group2-item-1">Item 2.1</Menu.Item>
          <Menu.Item data-testid="group2-item-2">Item 2.2</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
