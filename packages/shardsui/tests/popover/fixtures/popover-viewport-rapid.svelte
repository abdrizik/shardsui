<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  {#snippet children({ payload })}
    <Popover.Trigger payload={1} data-testid="trigger1">Trigger 1</Popover.Trigger>
    <Popover.Trigger payload={2} data-testid="trigger2">Trigger 2</Popover.Trigger>
    <Popover.Trigger payload={3} data-testid="trigger3">Trigger 3</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popup">
          <Popover.Viewport data-testid="viewport">Content {payload ?? 0}</Popover.Viewport>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>

<style>
  :global {
    [data-transitioning] [data-previous] {
      animation: rapid-slide-out 0.2s ease-out forwards;
    }

    [data-transitioning] [data-current] {
      animation: rapid-slide-in 0.2s ease-out forwards;
    }

    @keyframes rapid-slide-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    @keyframes rapid-slide-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
</style>
