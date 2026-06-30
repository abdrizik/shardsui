<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = true, disabled = true, onOpenChange = undefined, onItemClick = undefined } = $props()
</script>

<Menu.Root {open} {disabled} {onOpenChange}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="alpha">Alpha</Menu.Item>
        <Menu.Item data-testid="beta" onclick={onItemClick}>Beta</Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid="submenu-trigger" openOnHover={false}>
            Submenu
          </Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup data-testid="submenu-popup">
                <Menu.Item>Nested item</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
