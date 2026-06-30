<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { open = false } = $props()
</script>

<Popover.Root {open}>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">
        <Popover.Viewport data-testid="viewport">
          <div data-testid="content">Content</div>
        </Popover.Viewport>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
