<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    open = true,
    onSubmenuOpenChange = undefined
  }: { open?: boolean; onSubmenuOpenChange?: (open: boolean) => void } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal keepMounted>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.SubmenuRoot open onOpenChange={onSubmenuOpenChange}>
          <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup data-testid="submenu-popup" />
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
