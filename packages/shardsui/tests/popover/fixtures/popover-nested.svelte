<script lang="ts">
  import { Popover } from '$lib/components/popover'
</script>

<div>
  <button type="button" data-testid="outside">Outside</button>

  <Popover.Root open>
    <Popover.Trigger data-testid="parent-trigger">Parent</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="parent-popup">
          <Popover.Root>
            <Popover.Trigger data-testid="child-trigger">Child</Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Popup data-testid="child-popup">Child content</Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
