<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
  import { DirectionProvider } from '$lib/components/direction-provider'
</script>

<DirectionProvider direction="rtl">
  <NavigationMenu.Root orientation="vertical">
    <NavigationMenu.List>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#">Quick Start</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>

    <NavigationMenu.Portal>
      <NavigationMenu.Positioner>
        <NavigationMenu.Popup>
          <NavigationMenu.Viewport />
        </NavigationMenu.Popup>
      </NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  </NavigationMenu.Root>
</DirectionProvider>
