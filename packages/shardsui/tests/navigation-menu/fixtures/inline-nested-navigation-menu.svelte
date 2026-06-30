<script lang="ts">
  import { untrack } from 'svelte'
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    initialNestedValue = 'nested-item-1'
  }: {
    initialNestedValue?: string | null
  } = $props()

  let nestedValue = $state<string | null | undefined>(untrack(() => initialNestedValue))
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

      <NavigationMenu.Content>
        <div data-testid="popup-1">
          <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
          <NavigationMenu.Root bind:value={nestedValue}>
            <NavigationMenu.List data-testid="inline-nested-list">
              <NavigationMenu.Item value="nested-item-1">
                <NavigationMenu.Trigger data-testid="nested-trigger-1">
                  Nested Item 1
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div data-testid="nested-popup-1">
                    <NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
              <NavigationMenu.Item value="nested-item-2">
                <NavigationMenu.Trigger data-testid="nested-trigger-2">
                  Nested Item 2
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div data-testid="nested-popup-2">
                    <NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Viewport data-testid="inline-nested-viewport" />
          </NavigationMenu.Root>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div data-testid="popup-2">
          <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="positioner">
      <NavigationMenu.Popup data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
