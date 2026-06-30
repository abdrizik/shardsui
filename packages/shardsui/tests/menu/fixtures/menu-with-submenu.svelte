<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    submenuTriggerDisabled = false,
    openOnHover = true,
    closeParentOnEsc = false,
    submenuDelay = 100,
    submenuCloseDelay = undefined,
    triggerOpenOnHover = false,
    triggerDelay = undefined,
    modal = true,
    open = undefined,
    onOpenChange = undefined,
    triggerHtmlId = undefined
  } = $props()
</script>

<Menu.Root {open} {onOpenChange} {modal}>
  <Menu.Trigger id={triggerHtmlId} openOnHover={triggerOpenOnHover} delay={triggerDelay}
    >Toggle</Menu.Trigger
  >
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        <Menu.SubmenuRoot {closeParentOnEsc}>
          <Menu.SubmenuTrigger
            data-testid="submenu-trigger"
            disabled={submenuTriggerDisabled}
            {openOnHover}
            delay={submenuDelay}
            closeDelay={submenuCloseDelay}
          >
            Item 3
          </Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup data-testid="submenu">
                <Menu.Item data-testid="submenu-item-1">Item 3.1</Menu.Item>
                <Menu.Item data-testid="submenu-item-2">Item 3.2</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
