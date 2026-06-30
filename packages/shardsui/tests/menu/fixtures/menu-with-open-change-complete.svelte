<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = $bindable(false), onOpenChangeComplete = undefined } = $props()
</script>

<Menu.Root bind:open {onOpenChangeComplete}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
