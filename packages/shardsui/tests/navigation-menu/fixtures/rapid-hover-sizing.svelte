<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let expanded = $state(false)
</script>

<NavigationMenu.Root>
  <NavigationMenu.List style="display: flex">
    <NavigationMenu.Item value="product">
      <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div>
          <button type="button" onclick={() => (expanded = true)}>Expand Product</button>
          {#if expanded}
            <div style="width: 760px; height: 460px">Expanded product panel</div>
          {:else}
            <div style="width: 700px; height: 420px">Product panel</div>
          {/if}
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="solutions">
      <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div style="width: 500px; height: 320px">Solutions panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup class="rapid-hover-sizing-popup" data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>

<style>
  :global {
    .rapid-hover-sizing-popup {
      transition:
        width 350ms cubic-bezier(0.22, 1, 0.36, 1),
        height 350ms cubic-bezier(0.22, 1, 0.36, 1);
      width: var(--popup-width);
      height: var(--popup-height);
    }
  }
</style>
