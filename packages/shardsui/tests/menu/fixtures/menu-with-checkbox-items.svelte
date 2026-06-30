<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    checked = undefined,
    onCheckedChange = undefined,
    closeOnClick = false,
    disabled = false,
    keepMounted = false,
    modal = true
  } = $props()
</script>

<Menu.Root {modal}>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal {keepMounted}>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.CheckboxItem
          {checked}
          {onCheckedChange}
          {closeOnClick}
          {disabled}
          data-testid="checkbox-item"
        >
          Item
        </Menu.CheckboxItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
