<script lang="ts">
  import { Menubar } from '$lib/components/menubar'
  import { Menu } from '$lib/components/menu'

  let {
    onRootOpenChange,
    onSubmenuOpenChange,
    onNextOpenChange
  }: {
    onRootOpenChange?: (open: boolean) => void
    onSubmenuOpenChange?: (open: boolean) => void
    onNextOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Menubar>
  <Menu.Root onOpenChange={(open) => onRootOpenChange?.(open)}>
    <Menu.Trigger data-testid="menubar-file-trigger">File</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="menubar-file-menu">
        <Menu.Popup>
          <Menu.Item data-testid="menubar-file-item">Item 1</Menu.Item>
          <Menu.SubmenuRoot onOpenChange={(open) => onSubmenuOpenChange?.(open)}>
            <Menu.SubmenuTrigger data-testid="menubar-submenu-trigger">Share</Menu.SubmenuTrigger>
            <Menu.Portal>
              <Menu.Positioner data-testid="menubar-submenu-menu">
                <Menu.Popup>
                  <Menu.Item data-testid="menubar-submenu-item">Email</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.SubmenuRoot>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>

  <Menu.Root onOpenChange={(open) => onNextOpenChange?.(open)}>
    <Menu.Trigger data-testid="menubar-next-trigger">Edit</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="menubar-next-menu">
        <Menu.Popup>
          <Menu.Item>Edit Item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
