<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onActions }: { onActions?: (a: { close: () => void }) => void } = $props()

  let open = $state(false)

  $effect(() => {
    onActions?.({ close: () => (open = false) })
  })
</script>

<div>
  <input data-testid="input" />
  <Menu.Root modal={false} bind:open>
    <Menu.Trigger>Toggle</Menu.Trigger>
    <Menu.Portal keepMounted>
      <Menu.Positioner data-testid="menu-positioner">
        <Menu.Popup data-testid="menu">
          <Menu.Item data-testid="item-1">Item 1</Menu.Item>
          <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <input data-testid="after" />
</div>
