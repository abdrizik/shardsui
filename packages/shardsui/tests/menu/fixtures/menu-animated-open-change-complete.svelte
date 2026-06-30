<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    open = $bindable(false),
    onOpenChangeComplete
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<button type="button" data-testid="open-external" onclick={() => (open = true)}>Open</button>
<button type="button" data-testid="close-external" onclick={() => (open = false)}>Close</button>

<Menu.Root bind:open {onOpenChangeComplete}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu" class="menu-animation-test-indicator">
        <Menu.Item data-testid="item-1">Item 1</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

<style>
  :global {
    @keyframes menu-complete-enter {
      from {
        opacity: 0;
      }
    }

    @keyframes menu-complete-exit {
      to {
        opacity: 0;
      }
    }

    .menu-animation-test-indicator[data-starting-style] {
      animation: menu-complete-enter 1ms;
    }

    .menu-animation-test-indicator[data-ending-style] {
      animation: menu-complete-exit 1ms;
    }
  }
</style>
