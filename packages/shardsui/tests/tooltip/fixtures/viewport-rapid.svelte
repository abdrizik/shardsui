<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'
</script>

<Tooltip.Root>
  {#snippet children({ payload })}
    <Tooltip.Trigger payload={1} delay={0} data-testid="trigger1">Trigger 1</Tooltip.Trigger>
    <Tooltip.Trigger payload={2} delay={0} data-testid="trigger2">Trigger 2</Tooltip.Trigger>
    <Tooltip.Trigger payload={3} delay={0} data-testid="trigger3">Trigger 3</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          <Tooltip.Viewport class="rapid-viewport" data-testid="viewport">
            Content {payload}
          </Tooltip.Viewport>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>

<style>
  :global {
    .rapid-viewport[data-transitioning] [data-previous] {
      animation: rapid-slide-out 10s ease-out forwards;
    }

    .rapid-viewport[data-transitioning] [data-current] {
      animation: rapid-slide-in 10s ease-out forwards;
    }

    @keyframes rapid-slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(-30%);
        opacity: 0;
      }
    }

    @keyframes rapid-slide-in {
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
