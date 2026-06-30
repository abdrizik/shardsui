<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    open = $bindable(false),
    onOpenChangeComplete
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<button type="button" data-testid="open-external" onclick={() => (open = true)}>Open</button>
<button type="button" data-testid="close-external" onclick={() => (open = false)}>Close</button>

<Popover.Root bind:open {onOpenChangeComplete}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup" class="animation-test-indicator"></Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

<style>
  :global {
    @keyframes popover-complete-enter {
      from {
        opacity: 0;
      }
    }

    @keyframes popover-complete-exit {
      to {
        opacity: 0;
      }
    }

    .animation-test-indicator[data-starting-style] {
      animation: popover-complete-enter 1ms;
    }

    .animation-test-indicator[data-ending-style] {
      animation: popover-complete-exit 1ms;
    }
  }
</style>
