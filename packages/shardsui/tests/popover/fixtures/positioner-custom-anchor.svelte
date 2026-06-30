<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let anchor = $state<HTMLElement | null>(null)
</script>

<Popover.Root open>
  <Popover.Trigger as="div" data-testid="trigger" style="width: 100px; height: 100px;">
    Trigger
  </Popover.Trigger>
  <div
    bind:this={anchor}
    data-testid="custom-anchor"
    style="width: 50px; height: 50px; position: relative;"
  >
    Anchor
  </div>
  <Popover.Portal keepMounted>
    <Popover.Positioner data-testid="positioner" {anchor}>
      <Popover.Popup style="width: 100px; height: 100px;">Popup</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
