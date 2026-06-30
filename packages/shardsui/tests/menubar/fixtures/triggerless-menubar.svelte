<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Menubar } from '$lib/components/menubar'

  let open = $state(true)
</script>

<button data-testid="outside" type="button">Outside</button>
<Menubar>
  <Menu.Root bind:open>
    <Menu.Portal keepMounted>
      <Menu.Positioner>
        <Menu.Popup data-testid="triggerless-menu">
          <Menu.Item>Item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
