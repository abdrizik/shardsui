<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { handle = new Menu.Handle() } = $props()

  let open = $state(false)
</script>

<div>
  <Menu.Root
    {handle}
    bind:open={
      () => open,
      (next) => {
        if (next) open = true
      }
    }
  >
    <Menu.Trigger>Actions</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item>Item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <button type="button">Outside</button>
</div>
