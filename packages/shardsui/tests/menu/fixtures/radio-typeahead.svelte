<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onValueChange = undefined } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.RadioGroup {onValueChange}>
          <Menu.RadioItem value="one" data-testid="item-one">Item One</Menu.RadioItem>
          <Menu.RadioItem value="two" data-testid="item-two">Item Two</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
