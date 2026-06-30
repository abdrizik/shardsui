<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item>Aa</Menu.Item>
        <Menu.Item>ąa</Menu.Item>
        <Menu.Item>ąb</Menu.Item>
        <Menu.Item>ąc</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
