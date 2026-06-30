<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Popover } from '$lib/components/popover'

  let { as = 'button' }: { as?: 'button' | 'span' } = $props()
</script>

<Popover.Root open>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>
        <Menu.Root>
          <Menu.Trigger {as} data-testid="menu-trigger">Menu</Menu.Trigger>
        </Menu.Root>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
