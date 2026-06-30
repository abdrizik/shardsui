<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Trigger 1</Menu.Trigger>
  <Menu.Trigger>Trigger 2</Menu.Trigger>
  <Menu.Trigger>Trigger 3</Menu.Trigger>

  <Menu.Portal>
    <Menu.Positioner data-testid="positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-close">Close</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
