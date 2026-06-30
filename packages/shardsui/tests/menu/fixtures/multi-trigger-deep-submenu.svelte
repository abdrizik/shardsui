<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { detached = false }: { detached?: boolean } = $props()

  const handle = new Menu.Handle()
</script>

{#snippet content()}
  <Menu.Portal>
    <Menu.Positioner data-testid="level-1">
      <Menu.Popup>
        <Menu.Item>Item 1</Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid="submenu-trigger-1">Level 2</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner data-testid="level-2">
              <Menu.Popup>
                <Menu.Item>Item 2</Menu.Item>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger data-testid="submenu-trigger-2">Level 3</Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner data-testid="level-3">
                      <Menu.Popup>
                        <Menu.Item>Deep Item</Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
{/snippet}

<div>
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
  <button data-testid="outside">Outside</button>
</div>
