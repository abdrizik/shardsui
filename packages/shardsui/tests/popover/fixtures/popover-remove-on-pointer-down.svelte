<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let showButton = $state(true)
</script>

<Popover.Root open modal="trap-focus">
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup">
        {#if showButton}
          <button type="button" data-testid="remove" onpointerdown={() => (showButton = false)}>
            Remove on pointer down
          </button>
        {/if}
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
