<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Open menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup data-testid="submenu">
                <Menu.Item>Alpha</Menu.Item>
                <Menu.Item>Beta</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
