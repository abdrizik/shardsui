<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { handle = new Menu.Handle() } = $props()
</script>

<div>
  <Menu.Trigger {handle} id="trigger-1">Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger-2">Trigger 2</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger-3">Trigger 3</Menu.Trigger>

  <Menu.Root {handle}>
    <Menu.Portal>
      <Menu.Positioner data-testid="positioner">
        <Menu.Popup data-testid="popup">
          <Menu.Item data-testid="item-close">Close</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</div>
