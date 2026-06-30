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
        <Menu.Item />
        <Menu.Item>
          <div>Nested Content</div>
        </Menu.Item>
        <Menu.Item />
        <Menu.Item />
        <Menu.Item>Bc</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
