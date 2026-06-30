<script lang="ts">
  import { Menu } from '$lib/components/menu'

  const handle = new Menu.Handle<number>()
</script>

<div>
  <Menu.Trigger {handle} id="trigger1" payload={0} data-testid="trigger1">Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} id="trigger2" payload={1} data-testid="trigger2">Trigger 2</Menu.Trigger>

  <Menu.Root {handle}>
    {#snippet children({ payload })}
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Viewport>
              <div data-testid="content">Content {payload}</div>
            </Menu.Viewport>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    {/snippet}
  </Menu.Root>
</div>

<style>
  /* The popup is portaled out of this component, so the rules must be global. */
  @keyframes -global-viewport-slide-out {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-30%);
      opacity: 0;
    }
  }

  @keyframes -global-viewport-slide-in {
    from {
      transform: translateX(30%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  :global([data-transitioning] [data-previous]) {
    animation: viewport-slide-out 0.3s ease-out forwards;
  }

  :global([data-transitioning] [data-current]) {
    animation: viewport-slide-in 0.3s ease-out forwards;
  }
</style>
