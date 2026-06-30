<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { checked = false, value = undefined, onCheckedChange = undefined } = $props()
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.CheckboxItem {checked} {onCheckedChange} data-testid="checkbox-item">
          <Menu.CheckboxItemIndicator data-testid="checkbox-indicator" />
          Toggle
        </Menu.CheckboxItem>
        <Menu.RadioGroup {value}>
          <Menu.RadioItem value="a" data-testid="radio-item-a">
            <Menu.RadioItemIndicator data-testid="radio-indicator-a" />
            Option A
          </Menu.RadioItem>
          <Menu.RadioItem value="b" data-testid="radio-item-b">
            <Menu.RadioItemIndicator data-testid="radio-indicator-b" />
            Option B
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
