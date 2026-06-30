<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<div>
  <input type="text" data-testid="first-input" />
  <Popover.Root>
    <Popover.Trigger data-testid="trigger" openOnHover delay={0} closeDelay={0}
      >Toggle</Popover.Trigger
    >
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popover-popup" class="port-hover-popup" />
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <input type="text" data-testid="last-input" />
</div>

<style>
  :global(.port-hover-popup) {
    width: 100px;
    height: 100px;
    opacity: 1;
    transition: opacity 1ms;
  }
  :global(.port-hover-popup[data-exiting]) {
    opacity: 0;
  }
</style>
