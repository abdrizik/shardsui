<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<div>
  <Popover.Root>
    <Popover.Trigger as="div" data-testid="div-trigger">Toggle</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popup">Content</Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <button type="button" data-testid="other-button">Other button</button>
</div>
