<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import { Menu } from '$lib/components/menu'

  let { closeOnClick = true }: { closeOnClick?: boolean } = $props()

  let container = $state<HTMLDialogElement | null>(null)
</script>

<dialog open bind:this={container}>
  {#if container}
    <Popover.Root>
      <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
      <Popover.Portal {container}>
        <Popover.Positioner>
          <Popover.Popup data-testid="popover-popup">
            <Menu.Root>
              <Menu.Trigger data-testid="menu-trigger">Open nested</Menu.Trigger>
              <Menu.Portal {container}>
                <Menu.Positioner>
                  <Menu.Popup data-testid="menu-popup">
                    <Menu.Item {closeOnClick} data-testid="menu-item">Item</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  {/if}
</dialog>
