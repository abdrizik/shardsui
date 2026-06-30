<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel id="test-group">Test group</Menu.GroupLabel>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
