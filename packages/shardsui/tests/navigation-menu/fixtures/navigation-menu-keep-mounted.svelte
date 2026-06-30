<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    portalKeepMounted = false
  }: {
    portalKeepMounted?: boolean
  } = $props()
</script>

<NavigationMenu.Root>
  <NavigationMenu.List data-testid="list">
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content keepMounted data-testid="content-1">
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger>Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content keepMounted data-testid="content-2">
        <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal keepMounted={portalKeepMounted}>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport data-testid="viewport" />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
