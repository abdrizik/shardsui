<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import DialogShapes from './dialog-shapes.svelte'

  let { shape = 'contained' }: { shape?: 'contained' | 'detached' | 'multiple-detached' } = $props()
</script>

<DialogShapes {shape}>
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
</DialogShapes>
