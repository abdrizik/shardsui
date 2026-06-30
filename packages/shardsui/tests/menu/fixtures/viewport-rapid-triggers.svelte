<script lang="ts">
  import { Menu } from '$lib/components/menu'

  const handle = new Menu.Handle<number>()
</script>

<div>
  <Menu.Trigger {handle} id="trigger1" payload={1} data-testid="trigger1">Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger2" payload={2} data-testid="trigger2">Trigger 2</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger3" payload={3} data-testid="trigger3">Trigger 3</Menu.Trigger>

  <Menu.Root {handle}>
    {#snippet children({ payload })}
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup data-testid="popup">
            <Menu.Viewport>Content {payload}</Menu.Viewport>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    {/snippet}
  </Menu.Root>
</div>
