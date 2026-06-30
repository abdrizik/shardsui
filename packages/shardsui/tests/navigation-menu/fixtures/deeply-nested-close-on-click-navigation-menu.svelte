<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let level2Value = $state<string | null>('level2-item-1')
  let level3Value = $state<string | null>('level3-item-1')
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

      <NavigationMenu.Content>
        <div data-testid="content-1">
          <NavigationMenu.Root bind:value={level2Value}>
            <NavigationMenu.List>
              <NavigationMenu.Item value="level2-item-1">
                <NavigationMenu.Trigger data-testid="level2-trigger-1">
                  Level 2 Item 1
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div data-testid="level2-content-1">
                    <NavigationMenu.Root bind:value={level3Value}>
                      <NavigationMenu.List>
                        <NavigationMenu.Item value="level3-item-1">
                          <NavigationMenu.Trigger data-testid="level3-trigger-1">
                            Level 3 Item 1
                          </NavigationMenu.Trigger>
                          <NavigationMenu.Content>
                            <div data-testid="level3-content-1">
                              <NavigationMenu.Link
                                href="#level3-link-1"
                                closeOnClick
                                data-testid="level3-link-1"
                              >
                                Level 3 Link 1
                              </NavigationMenu.Link>
                            </div>
                          </NavigationMenu.Content>
                        </NavigationMenu.Item>
                      </NavigationMenu.List>
                      <NavigationMenu.Viewport />
                    </NavigationMenu.Root>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.Viewport />
          </NavigationMenu.Root>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="top-level-positioner">
      <NavigationMenu.Popup data-testid="nav-popup">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
