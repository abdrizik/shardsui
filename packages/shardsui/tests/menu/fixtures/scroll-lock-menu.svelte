<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { width = 'calc(100vw - 10px)' }: { width?: string } = $props()
</script>

<Menu.Root modal>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner" style="width: {width}">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
