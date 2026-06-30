<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let nestedValue = $state<string | null>('nested-item-2')
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Product</NavigationMenu.Trigger>

      <NavigationMenu.Content data-testid="popup-1">
        <NavigationMenu.Root bind:value={nestedValue}>
          <NavigationMenu.List>
            <NavigationMenu.Item value="nested-item-1">
              <NavigationMenu.Trigger data-testid="nested-trigger-1">
                Engineering Leads
              </NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="nested-popup-1">
                <NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="nested-item-2">
              <NavigationMenu.Trigger data-testid="nested-trigger-2"
                >Startups</NavigationMenu.Trigger
              >
              <NavigationMenu.Content data-testid="nested-popup-2">
                <NavigationMenu.Link href="#quick-start">Quick start</NavigationMenu.Link>
                <NavigationMenu.Link href="#menu">Menu</NavigationMenu.Link>
                <NavigationMenu.Link href="#select" data-testid="nested-last-link"
                  >Select</NavigationMenu.Link
                >
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Viewport />
        </NavigationMenu.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Learn</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-2">
        <NavigationMenu.Link href="#learn">Learn link</NavigationMenu.Link>
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
