<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    trigger1 = { top: 10, left: 10 },
    trigger2 = { top: 100, left: 200 },
    keepMounted = false
  }: {
    trigger1?: { top: number; left: number }
    trigger2?: { top: number; left: number }
    keepMounted?: boolean
  } = $props()

  let open = $state(false)
</script>

<button type="button" data-testid="close-external" onclick={() => (open = false)}>Close</button>

<Popover.Root bind:open>
  {#snippet children({ payload })}
    <Popover.Trigger
      payload={0}
      data-testid="trigger1"
      style="position: absolute; top: {trigger1.top}px; left: {trigger1.left}px; width: 100px; height: 50px;"
    >
      Trigger 1
    </Popover.Trigger>
    <Popover.Trigger
      payload={1}
      data-testid="trigger2"
      style="position: absolute; top: {trigger2.top}px; left: {trigger2.left}px; width: 100px; height: 50px;"
    >
      Trigger 2
    </Popover.Trigger>
    <Popover.Portal {keepMounted}>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popup">
          <Popover.Viewport data-testid="viewport">
            <div data-testid="content">Content {payload ?? 0}</div>
          </Popover.Viewport>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>

<style>
  :global {
    [data-transitioning] [data-previous] {
      animation: slide-out 0.2s ease-out forwards;
    }

    [data-transitioning] [data-current] {
      animation: slide-in 0.2s ease-out forwards;
    }

    @keyframes slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(-30%);
        opacity: 0;
      }
    }

    @keyframes slide-in {
      from {
        transform: translateX(30%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  }
</style>
