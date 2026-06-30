<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    detached = false,
    submenuOpenOnHover = true,
    onSubmenuItemClick = undefined
  }: {
    detached?: boolean
    submenuOpenOnHover?: boolean
    onSubmenuItemClick?: (event: MouseEvent | KeyboardEvent) => void
  } = $props()

  const handle = new Menu.Handle()
</script>

{#snippet content()}
  <Menu.Portal>
    <Menu.Positioner data-testid="menu">
      <Menu.Popup>
        <Menu.Item>Standalone</Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid="submenu-trigger" openOnHover={submenuOpenOnHover}>
            More
          </Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner data-testid="submenu">
              <Menu.Popup>
                <Menu.Item data-testid="submenu-item" onclick={onSubmenuItemClick}>
                  Nested
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
{/snippet}

{#if detached}
  <Menu.Trigger {handle} id="trigger-1">Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger-2">Trigger 2</Menu.Trigger>
  <Menu.Root {handle}>
    {@render content()}
  </Menu.Root>
{:else}
  <Menu.Root>
    <Menu.Trigger id="trigger-1">Trigger 1</Menu.Trigger>
    <Menu.Trigger id="trigger-2">Trigger 2</Menu.Trigger>
    {@render content()}
  </Menu.Root>
{/if}
