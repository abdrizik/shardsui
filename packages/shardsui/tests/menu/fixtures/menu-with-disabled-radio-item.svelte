<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { value = 'one', onValueChange = undefined, onClick = undefined } = $props()
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.RadioGroup {value} {onValueChange}>
          <Menu.RadioItem value="one" onclick={onClick} disabled data-testid="radio-item-one"
            >one</Menu.RadioItem
          >
          <Menu.RadioItem value="two" onclick={onClick} data-testid="radio-item-two"
            >two</Menu.RadioItem
          >
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
