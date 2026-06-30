<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let open = $state(false)
</script>

<div>
  <button type="button" onclick={() => (open = true)}>Open menu programmatically</button>
  <Menu.Root {open} triggerId="menu-trigger" onOpenChange={(next) => (open = next)}>
    <Menu.Trigger id="menu-trigger">Menu trigger</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item>Close menu</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</div>
