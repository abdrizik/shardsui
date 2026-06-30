<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = true }: { open?: boolean } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid="submenu-trigger" delay={0}>Item 2</Menu.SubmenuTrigger>
          <Menu.Portal keepMounted>
            <Menu.Positioner data-testid="submenu-positioner">
              <Menu.Popup data-testid="submenu">
                <Menu.Item>Item 2.1</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
        <Menu.Item data-testid="item-3">Item 3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
