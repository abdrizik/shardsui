<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    onDisabledItemClick = undefined,
    onDisabledItemKeyDown = undefined,
    onDisabledItemKeyUp = undefined
  }: {
    onDisabledItemClick?: (event: MouseEvent) => void
    onDisabledItemKeyDown?: (event: KeyboardEvent) => void
    onDisabledItemKeyUp?: (event: KeyboardEvent) => void
  } = $props()
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.Item
          data-testid="item-2"
          disabled
          onclick={onDisabledItemClick}
          onkeydown={onDisabledItemKeyDown}
          onkeyup={onDisabledItemKeyUp}
        >
          Item 2 (disabled)
        </Menu.Item>
        <Menu.Item data-testid="item-3">Item 3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
