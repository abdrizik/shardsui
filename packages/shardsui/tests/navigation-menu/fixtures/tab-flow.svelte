<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let nestedValue = $state<string | null>('developers')
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>

      <NavigationMenu.Content data-testid="popup-product">
        <NavigationMenu.Root bind:value={nestedValue} orientation="vertical">
          <NavigationMenu.List>
            <NavigationMenu.Item value="developers">
              <NavigationMenu.Trigger data-testid="nested-trigger-developers">
                Developers
              </NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="nested-popup-developers">
                <NavigationMenu.Link href="#get-started" data-testid="nested-link-get-started">
                  Get started
                </NavigationMenu.Link>
                <NavigationMenu.Link href="#composition" data-testid="nested-link-composition">
                  Composition
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="design-systems">
              <NavigationMenu.Trigger data-testid="nested-trigger-design-systems">
                Design Systems
              </NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="nested-popup-design-systems">
                <NavigationMenu.Link
                  href="#styling"
                  data-testid="nested-link-design-systems-styling"
                >
                  Styling
                </NavigationMenu.Link>
                <NavigationMenu.Link href="#accessibility">Accessibility</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="engineering-leads">
              <NavigationMenu.Trigger>Engineering Leads</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Viewport />
        </NavigationMenu.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
      <NavigationMenu.Content>
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
