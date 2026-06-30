<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onclick = undefined }: { onclick?: (event: MouseEvent) => void } = $props()
</script>

<Menu.Root open>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.LinkItem href="#one" {onclick}>Item One</Menu.LinkItem>
        <Menu.LinkItem href="#two" {onclick}>Item Two</Menu.LinkItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
