<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let open = $state(false)
</script>

<Menu.Root
  bind:open={
    () => open,
    (next) => {
      if (!next) open = false
    }
  }
>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item>Item</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
