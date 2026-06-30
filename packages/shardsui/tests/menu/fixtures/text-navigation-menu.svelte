<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = undefined }: { open?: boolean } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item>Aa</Menu.Item>
        <Menu.Item>Ba</Menu.Item>
        <Menu.Item>Bb</Menu.Item>
        <Menu.Item>Ca</Menu.Item>
        <Menu.Item>Cb</Menu.Item>
        <Menu.Item>Cd</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
