<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { onItemClick = undefined }: { onItemClick?: () => void } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu">
        <Menu.Item onclick={onItemClick}>Item One</Menu.Item>
        <Menu.Item onclick={onItemClick}>Item Two</Menu.Item>
        <Menu.Item onclick={onItemClick}>Item Three</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
