<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    onContentFocusIn = undefined
  }: {
    onContentFocusIn?: (event: FocusEvent) => void
  } = $props()
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger data-testid="overview-trigger">Overview</NavigationMenu.Trigger>
      <NavigationMenu.Content
        data-testid="overview-content"
        style="color: rgb(255, 0, 0);"
        onfocusin={onContentFocusIn}
      >
        <button type="button" data-testid="content-button">Inside</button>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport data-testid="nav-viewport" />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
