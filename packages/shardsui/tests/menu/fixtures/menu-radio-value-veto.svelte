<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let value = $state<unknown>(undefined)
</script>

<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.RadioGroup bind:value={() => value, () => {}}>
          <Menu.RadioItem value="a" data-testid="radio-item-a">Option A</Menu.RadioItem>
          <Menu.RadioItem value="b" data-testid="radio-item-b">Option B</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
