<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let { onContentRef = undefined }: { onContentRef?: (element: HTMLElement | null) => void } =
    $props()

  let contentRef = $state<HTMLElement | null>(null)

  $effect(() => {
    onContentRef?.(contentRef)
  })
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger data-testid="overview-trigger">Overview</NavigationMenu.Trigger>
      <NavigationMenu.Content as="section" bind:ref={contentRef} data-testid="overview-content">
        <p>Overview content</p>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport data-testid="nav-viewport">
          <span data-testid="viewport-child">Viewport child</span>
        </NavigationMenu.Viewport>
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
