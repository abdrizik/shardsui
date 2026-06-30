<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    handle = new Menu.Handle<number>(),
    open = $bindable(false),
    triggerId = undefined
  } = $props()
</script>

<div>
  <Menu.Trigger {handle} id="trigger-1" payload={1}>Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger-2" payload={2}>Trigger 2</Menu.Trigger>

  <Menu.Root {handle} bind:open {triggerId}>
    {#snippet children({ payload })}
      <Menu.Portal>
        <Menu.Positioner data-testid="positioner">
          <Menu.Popup data-testid="popup">
            <Menu.Item data-testid="content">{payload}</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    {/snippet}
  </Menu.Root>
</div>
