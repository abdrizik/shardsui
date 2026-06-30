<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { submenu = false }: { submenu?: boolean } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item>Item 1</Menu.Item>
        {#if submenu}
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger data-testid="submenu-trigger">Item 2</Menu.SubmenuTrigger>
            <Menu.Portal>
              <Menu.Positioner>
                <Menu.Popup data-testid="submenu">
                  <Menu.Item>Nested 2.1</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.SubmenuRoot>
        {:else}
          <Menu.Item data-testid="item-2">Item 2</Menu.Item>
        {/if}
        <Menu.Item>Item 3</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
