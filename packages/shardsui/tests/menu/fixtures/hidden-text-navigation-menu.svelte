<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { open = undefined }: { open?: boolean } = $props()
</script>

<Menu.Root {open}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item data-testid="item-hidden" style="display: none">Apple</Menu.Item>
        <Menu.Item data-testid="item-apricot">Apricot</Menu.Item>
        <Menu.Item data-testid="item-banana">Banana</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
