<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="overview-content">
        <div><NavigationMenu.Link href="#">Quick Start</NavigationMenu.Link></div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Handbook</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="handbook-content">
        <div><NavigationMenu.Link href="#">Styling components</NavigationMenu.Link></div>
        <div><NavigationMenu.Link href="#">Second Link</NavigationMenu.Link></div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="positioner">
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
