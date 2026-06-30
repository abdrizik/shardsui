<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let checked = $state(false)
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.CheckboxItem bind:checked={() => checked, () => {}} data-testid="checkbox-item">
          Item
        </Menu.CheckboxItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
