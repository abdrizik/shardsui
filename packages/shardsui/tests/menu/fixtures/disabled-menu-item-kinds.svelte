<script lang="ts">
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root open disabled>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item data-testid="item">Item</Menu.Item>
        <Menu.CheckboxItem data-testid="checkbox-item">Checkbox item</Menu.CheckboxItem>
        <Menu.RadioGroup>
          <Menu.RadioItem data-testid="radio-item" value="radio">Radio item</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
