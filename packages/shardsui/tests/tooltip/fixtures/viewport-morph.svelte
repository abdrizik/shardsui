<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Root>
  {#snippet children({ payload })}
    <Tooltip.Trigger
      payload={0}
      delay={0}
      data-testid="trigger1"
      style="position: absolute; top: 10px; left: 10px; width: 100px; height: 50px;"
      >Trigger 1</Tooltip.Trigger
    >
    <Tooltip.Trigger
      payload={1}
      delay={0}
      data-testid="trigger2"
      style="position: absolute; top: 100px; left: 200px; width: 100px; height: 50px;"
      >Trigger 2</Tooltip.Trigger
    >
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          <Tooltip.Viewport>
            <div data-testid="content">Content {payload}</div>
          </Tooltip.Viewport>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>

<style>
  :global {
    [data-transitioning] [data-previous] {
      animation: slide-out 0.3s ease-out forwards;
    }

    [data-transitioning] [data-current] {
      animation: slide-in 0.3s ease-out forwards;
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
