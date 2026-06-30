<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    onOpenChangeComplete = undefined
  }: {
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<NavigationMenu.Root {onOpenChangeComplete}>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
      <NavigationMenu.Content class="scoped-exit-content">
        <div style="width: 675px; height: 220px">Product panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
      <NavigationMenu.Content class="scoped-exit-content">
        <div style="width: 500px; height: 180px">Learn panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup class="scoped-exit-popup" data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>

<style>
  :global {
    .scoped-exit-popup {
      transition-property: opacity, transform, width, height;
      transition-duration: 350ms;
      transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    }

    .scoped-exit-popup[data-starting-style],
    .scoped-exit-popup[data-ending-style] {
      opacity: 0;
      transform: scale(0.9);
    }

    .scoped-exit-popup[data-ending-style] {
      transition-property: opacity, transform;
      transition-duration: 150ms;
      transition-timing-function: ease;
    }

    .scoped-exit-content {
      transition:
        opacity 175ms ease,
        transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .scoped-exit-content[data-starting-style],
    .scoped-exit-content[data-ending-style] {
      opacity: 0;
    }

    .scoped-exit-content[data-starting-style][data-activation-direction='left'] {
      transform: translateX(-2rem);
    }

    .scoped-exit-content[data-starting-style][data-activation-direction='right'] {
      transform: translateX(2rem);
    }

    .scoped-exit-content[data-ending-style] {
      transition-duration: 175ms;
      transition-timing-function: ease;
    }

    .scoped-exit-content[data-ending-style][data-activation-direction='left'] {
      transform: translateX(2rem);
    }

    .scoped-exit-content[data-ending-style][data-activation-direction='right'] {
      transform: translateX(-2rem);
    }
  }
</style>
