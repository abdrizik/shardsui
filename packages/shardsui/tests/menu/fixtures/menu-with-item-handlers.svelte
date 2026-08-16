<script lang="ts">
  import type { PreventableEvent } from '$lib'
  import { Menu } from '$lib/components/menu'

  let {
    onItem1Click = undefined,
    onItem2Click = undefined,
    onOpenChange = undefined,
    closeOnClick = true,
    open = undefined
  }: {
    onItem1Click?: (event: MouseEvent & PreventableEvent) => void
    onItem2Click?: (event: MouseEvent & PreventableEvent) => void
    onOpenChange?: (open: boolean) => void
    closeOnClick?: boolean
    open?: boolean
  } = $props()
</script>

<Menu.Root {open} {onOpenChange}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1" onclick={onItem1Click} {closeOnClick}>Item 1</Menu.Item>
        <Menu.Item data-testid="item-2" onclick={onItem2Click}>Item 2</Menu.Item>
        <Menu.Item data-testid="item-3">Item 3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
