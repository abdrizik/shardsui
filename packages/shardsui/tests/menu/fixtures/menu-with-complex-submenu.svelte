<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    closeParentOnEsc = false,
    modal = true,
    open = undefined,
    triggerOpenOnHover = false,
    triggerDelay = undefined,
    submenuDelay = undefined
  } = $props()
</script>

<Menu.Root {modal} {open}>
  <Menu.Trigger openOnHover={triggerOpenOnHover} delay={triggerDelay}>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        <Menu.Item data-testid="item-3" disabled>Item 3</Menu.Item>
        <Menu.SubmenuRoot {closeParentOnEsc}>
          <Menu.SubmenuTrigger data-testid="submenu-trigger" delay={submenuDelay}
            >Item 4</Menu.SubmenuTrigger
          >
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup data-testid="submenu">
                <Menu.Item data-testid="item-4_1">Item 4.1</Menu.Item>
                <Menu.Item data-testid="item-4_2">Item 4.2</Menu.Item>
                <Menu.SubmenuRoot {closeParentOnEsc}>
                  <Menu.SubmenuTrigger data-testid="nested-submenu-trigger" delay={submenuDelay}
                    >Item 4.3</Menu.SubmenuTrigger
                  >
                  <Menu.Portal>
                    <Menu.Positioner>
                      <Menu.Popup data-testid="nested-submenu">
                        <Menu.Item data-testid="item-4_3_1">Item 4.3.1</Menu.Item>
                        <Menu.Item data-testid="item-4_3_2">Item 4.3.2</Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
        <Menu.Item data-testid="item-5">Item 5</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
