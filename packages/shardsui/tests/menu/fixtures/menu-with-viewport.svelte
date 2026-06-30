<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = undefined } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger>Trigger</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Viewport>
          <div data-testid="content">Content</div>
        </Menu.Viewport>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
