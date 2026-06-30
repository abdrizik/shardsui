<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { handle = new Menu.Handle() } = $props()
</script>

<div>
  <Menu.Root {handle}>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item>Menu Content</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <Menu.Trigger {handle} id="trigger">Trigger</Menu.Trigger>
</div>
