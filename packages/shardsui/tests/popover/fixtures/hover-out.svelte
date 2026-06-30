<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    open = $bindable(false),
    external = false,
    openOnHover = true,
    delay = undefined
  }: {
    open?: boolean
    external?: boolean
    openOnHover?: boolean
    delay?: number
  } = $props()
</script>

{#if external}
  <button type="button" data-testid="show" onclick={() => (open = true)}>Show</button>
{/if}
<Popover.Root bind:open>
  <Popover.Trigger data-testid="trigger" {openOnHover} {delay}>Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner data-testid="positioner">
      <Popover.Popup data-testid="popover-popup">Content</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
