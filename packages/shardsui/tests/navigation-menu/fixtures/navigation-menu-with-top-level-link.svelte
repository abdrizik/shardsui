<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-1">
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-2">
        <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
        Top level link
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="top-level-positioner">
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
