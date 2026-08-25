<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained'
  }: { arrangement?: 'contained' | 'detached' | 'multiple-detached' } = $props()
</script>

<DialogArrangements {arrangement}>
  <Menu.Root>
    <Menu.Trigger>Open menu</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner data-testid="menu-positioner">
        <Menu.Popup>
          <Menu.Item>Item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</DialogArrangements>
