<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger data-testid="trigger">Open menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup id={popupId} data-testid="popup">
        <Menu.Item>Item</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
