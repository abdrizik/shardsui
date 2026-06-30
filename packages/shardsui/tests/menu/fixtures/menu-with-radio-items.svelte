<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    value = undefined,
    onValueChange = undefined,
    groupDisabled = false,
    closeOnClick = false,
    keepMounted = false,
    modal = true
  } = $props()
</script>

<Menu.Root {modal}>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal {keepMounted}>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.RadioGroup {value} {onValueChange} disabled={groupDisabled}>
          <Menu.GroupLabel data-testid="radio-group-label">Sort by</Menu.GroupLabel>
          <Menu.RadioItem value="a" {closeOnClick} data-testid="radio-item-a"
            >Option A</Menu.RadioItem
          >
          <Menu.RadioItem value="b" {closeOnClick} data-testid="radio-item-b"
            >Option B</Menu.RadioItem
          >
          <Menu.RadioItem value="c" {closeOnClick} data-testid="radio-item-c"
            >Option C</Menu.RadioItem
          >
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
