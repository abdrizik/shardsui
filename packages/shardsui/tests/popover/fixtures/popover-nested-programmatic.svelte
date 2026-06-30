<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let childOpen = $state(false)
</script>

<Popover.Root>
  <Popover.Trigger data-testid="parent-trigger">Parent trigger</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="parent-popup">
        <button type="button" data-testid="child-opener" onclick={() => (childOpen = true)}>
          Open child programmatically
        </button>

        <Popover.Root bind:open={childOpen} triggerId="child-reference">
          <Popover.Trigger id="child-reference" data-testid="child-trigger">
            Child reference
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup data-testid="child-popup">
                <Popover.Close data-testid="close-child">Close child</Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Close data-testid="close-parent">Close parent</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
