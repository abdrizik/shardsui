<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Alpha</Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid="submenu-trigger">Reports</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.Item>Monthly</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
