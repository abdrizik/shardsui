<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Toolbar } from '$lib/components/toolbar'

  let { onparentkeydown }: { onparentkeydown?: (event: KeyboardEvent) => void } = $props()

  let toolbar = $state<HTMLElement | null>(null)
</script>

<div onkeydown={onparentkeydown} role="presentation">
  <Toolbar.Root bind:ref={toolbar} data-testid="toolbar">
    <Toolbar.Button data-testid="first">First</Toolbar.Button>
    <Menu.Root>
      <Menu.Trigger data-testid="trigger">Open</Menu.Trigger>
      <Menu.Portal container={toolbar} keepMounted>
        <Menu.Positioner>
          <Menu.Popup data-testid="popup">
            <Menu.Item data-testid="item">Item</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
    <Toolbar.Button data-testid="last">Last</Toolbar.Button>
  </Toolbar.Root>
</div>
