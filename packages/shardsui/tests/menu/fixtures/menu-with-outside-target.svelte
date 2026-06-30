<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onOpenChange = undefined }: { onOpenChange?: (open: boolean) => void } = $props()
</script>

<div>
  <Menu.Root {onOpenChange}>
    <Menu.Trigger>Toggle</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="menu-positioner">
        <Menu.Popup data-testid="menu">
          <Menu.Item data-testid="item-1">1</Menu.Item>
          <Menu.Item data-testid="item-2">2</Menu.Item>
          <Menu.Item data-testid="item-3">3</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <div data-testid="outside">Outside</div>
</div>
