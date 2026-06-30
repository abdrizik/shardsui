<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  {#snippet children({ payload })}
    <Menu.Trigger payload="first" data-testid="trigger1">Trigger 1</Menu.Trigger>
    <Menu.Trigger payload="second" data-testid="trigger2">Trigger 2</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <div data-testid="payload">{payload ?? ''}</div>
          <Menu.Item>Item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/snippet}
</Menu.Root>
