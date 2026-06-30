<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
      <NavigationMenu.Content class="test-navigation-menu-content">
        <div style="width: 675px; height: 220px">Product panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
        Top level link
      </NavigationMenu.Link>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
      <NavigationMenu.Content class="test-navigation-menu-content">
        <div style="width: 500px; height: 180px">Learn panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal keepMounted>
    <NavigationMenu.Positioner data-testid="positioner">
      <NavigationMenu.Popup class="test-navigation-menu-popup" data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
