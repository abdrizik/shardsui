<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { onSeen }: { onSeen: (value: boolean) => void } = $props()

  let open = $state(false)
</script>

<Popover.Root bind:open onOpenChange={() => onSeen(open)}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
