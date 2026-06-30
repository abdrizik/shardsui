<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onCheckedChange = undefined } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.CheckboxItem {onCheckedChange} data-testid="item-one">Item One</Menu.CheckboxItem>
        <Menu.CheckboxItem {onCheckedChange} data-testid="item-two">Item Two</Menu.CheckboxItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
