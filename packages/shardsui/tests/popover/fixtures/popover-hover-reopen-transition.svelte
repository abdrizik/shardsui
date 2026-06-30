<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  <Popover.Trigger openOnHover delay={1} data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal keepMounted>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup" class="animation-test-indicator"
        >Content</Popover.Popup
      >
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

<style>
  :global {
    @keyframes popover-reopen-during-close {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.01;
      }
    }

    .animation-test-indicator[data-ending-style] {
      animation: popover-reopen-during-close 50ms linear forwards;
    }
  }
</style>
