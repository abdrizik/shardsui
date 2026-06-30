<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    open = true,
    modal = true,
    includeClose = true
  }: {
    open?: boolean
    modal?: boolean | 'trap-focus'
    includeClose?: boolean
  } = $props()
</script>

<div>
  <button data-testid="outside">Outside</button>
  <Popover.Root {open} {modal}>
    <Popover.Trigger data-testid="trigger">Trigger</Popover.Trigger>
    <input data-testid="focus-target" />
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popover-popup">
          {#if includeClose}
            <Popover.Close data-testid="close" aria-label="Close popover" />
          {:else}
            <input data-testid="input-inside" />
          {/if}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
