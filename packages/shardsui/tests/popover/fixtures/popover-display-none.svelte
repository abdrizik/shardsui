<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let hidden = $state(false)
</script>

<Popover.Root open>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popup">
        <button
          type="button"
          data-testid="hide-button"
          style:display={hidden ? 'none' : null}
          onclick={() => (hidden = true)}
        >
          Hide
        </button>
        <input />
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
