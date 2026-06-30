<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<div>
  <input data-testid="before" />
  <Popover.Root>
    <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
    <input data-testid="after" />
    <Popover.Portal keepMounted>
      <Popover.Positioner>
        <Popover.Popup data-testid="popover-popup">
          <button type="button" data-testid="inside">Inside</button>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
