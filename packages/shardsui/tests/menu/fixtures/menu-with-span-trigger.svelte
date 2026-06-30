<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { as = 'span' }: { as?: 'button' | 'span' } = $props()
</script>

<Menu.Root>
  <Menu.Trigger {as}>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item>1</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
