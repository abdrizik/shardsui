<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<Popover.Root>
  {#snippet children({ payload })}
    <Popover.Trigger
      data-testid="trigger-1"
      payload="One"
      openOnHover
      delay={0}
      closeDelay={0}
      style="pointer-events: none"
    >
      One
    </Popover.Trigger>
    <Popover.Trigger
      data-testid="trigger-2"
      payload="Two"
      openOnHover
      delay={0}
      closeDelay={0}
      style="pointer-events: none"
    >
      Two
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup>
          <span data-testid="content">{payload}</span>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>
