<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Group>
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
        </Menu.Group>
        <Menu.Group>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
