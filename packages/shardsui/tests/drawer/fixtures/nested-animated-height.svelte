<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<svelte:head>
  <style>
    @keyframes test-drawer-exit {
      to {
        opacity: 0;
      }
    }
    .animation-test-parent-popup {
      height: var(--drawer-height, auto);
      overflow: hidden;
      transition: height 100ms linear;
    }
    .animation-test-parent-popup[data-nested-drawer-open] {
      height: var(--drawer-frontmost-height, var(--drawer-height));
    }
    .animation-test-parent-content {
      display: block;
      height: 160px;
    }
    .animation-test-child-content {
      display: block;
      height: 64px;
    }
    .animation-test-child-popup[data-ending-style] {
      animation: test-drawer-exit 100ms;
    }
  </style>
</svelte:head>

<Drawer.Root open modal={false}>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup class="animation-test-parent-popup" data-testid="parent-popup">
        <div class="animation-test-parent-content"></div>
        <Drawer.Root modal={false}>
          <Drawer.Trigger>Open nested drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup class="animation-test-child-popup" data-testid="child-popup">
                <div class="animation-test-child-content"></div>
                <Drawer.Close>Close nested drawer</Drawer.Close>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
