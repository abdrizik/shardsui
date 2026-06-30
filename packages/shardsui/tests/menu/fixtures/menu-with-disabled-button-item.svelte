<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">1</Menu.Item>
        <Menu.Item as="button" disabled data-testid="item-2">2</Menu.Item>
        <Menu.Item data-testid="item-3">3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
