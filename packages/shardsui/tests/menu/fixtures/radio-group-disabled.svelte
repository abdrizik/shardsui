<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onValueChange = undefined, onItemClick = undefined, onItemKeyDown = undefined } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.RadioGroup disabled {onValueChange}>
          <Menu.RadioItem
            value="one"
            data-testid="item-1"
            onclick={onItemClick}
            onkeydown={onItemKeyDown}
          >
            one
          </Menu.RadioItem>
          <Menu.RadioItem
            value="two"
            data-testid="item-2"
            onclick={onItemClick}
            onkeydown={onItemKeyDown}
          >
            two
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
