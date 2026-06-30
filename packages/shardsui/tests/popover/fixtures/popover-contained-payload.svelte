<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  {#snippet children({ payload })}
    <Popover.Trigger payload={1} data-testid="trigger-1">Trigger 1</Popover.Trigger>
    <Popover.Trigger payload={2} data-testid="trigger-2">Trigger 2</Popover.Trigger>

    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popup">
          <span data-testid="content">{payload}</span>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>
