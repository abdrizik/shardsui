<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
  import { DirectionProvider } from '$lib/components/direction-provider'
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    direction = 'ltr',
    side = 'left'
  }: {
    direction?: 'ltr' | 'rtl'
    side?: Side
  } = $props()
</script>

<DirectionProvider {direction}>
  <NavigationMenu.Root>
    <NavigationMenu.List>
      <NavigationMenu.Item value="item-1">
        <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Portal>
      <NavigationMenu.Positioner {side}>
        <NavigationMenu.Popup data-testid="popup-root">
          <NavigationMenu.Viewport />
        </NavigationMenu.Popup>
      </NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  </NavigationMenu.Root>
</DirectionProvider>
