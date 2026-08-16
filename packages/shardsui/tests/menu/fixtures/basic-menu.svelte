<script lang="ts">
  import type { PreventableEvent } from '$lib'
  import { Menu } from '$lib/components/menu'

  let {
    onOpenChange = undefined,
    open = undefined,
    modal = true,
    triggerDisabled = false,
    triggerOnClick = undefined,
    triggerOnMouseDown = undefined
  }: {
    onOpenChange?: (open: boolean) => void
    open?: boolean
    modal?: boolean
    triggerDisabled?: boolean
    triggerOnClick?: (event: MouseEvent & PreventableEvent) => void
    triggerOnMouseDown?: (event: MouseEvent & PreventableEvent) => void
  } = $props()
</script>

<Menu.Root {onOpenChange} {open} {modal}>
  <Menu.Trigger
    disabled={triggerDisabled}
    onclick={triggerOnClick}
    onmousedown={triggerOnMouseDown}
  >
    Toggle
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        <Menu.Item data-testid="item-3">Item 3</Menu.Item>
        <Menu.Item data-testid="item-4">Item 4</Menu.Item>
        <Menu.Item data-testid="item-5">Item 5</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
