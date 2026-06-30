<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="menu-positioner">
      <Menu.Popup data-testid="menu" class="menu-transition-test-indicator">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
        <Menu.Item data-testid="item-2">Item 2</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

<style>
  :global {
    .menu-transition-test-indicator {
      transition:
        transform 100ms ease-out,
        opacity 100ms ease-out;
    }

    .menu-transition-test-indicator[data-ending-style] {
      opacity: 0;
      transform: scale(0.98);
    }
  }
</style>
