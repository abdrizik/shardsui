<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { wide = true }: { wide?: boolean } = $props()
</script>

<Popover.Root modal>
  <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner
      data-testid="positioner"
      style={wide ? 'width: calc(100vw - 10px)' : 'width: 240px'}
    >
      <Popover.Popup>Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
