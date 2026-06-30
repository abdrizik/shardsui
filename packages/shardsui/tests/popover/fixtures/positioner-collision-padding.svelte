<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { open = false, collisionPadding = 12 }: { open?: boolean; collisionPadding?: number } =
    $props()
</script>

<div style="position: fixed; bottom: 8px; left: 16px">
  <Popover.Root {open}>
    <Popover.Trigger data-testid="trigger" style="width: 72px; height: 36px">Toggle</Popover.Trigger
    >
    <Popover.Portal>
      <Popover.Positioner
        data-testid="positioner"
        side="bottom"
        sideOffset={8}
        {collisionPadding}
        collisionAvoidance={{ fallbackAxisSide: 'none' }}
      >
        <Popover.Popup
          data-testid="popover-popup"
          style="width: 200px; height: 1000px; max-height: var(--available-height)"
        >
          Popup
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
