<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()

  let key = $state(1)
  let showExtraTrigger = $state(true)
</script>

<button
  type="button"
  data-testid="toggle"
  onclick={() => {
    showExtraTrigger = !showExtraTrigger
    key += 1
  }}
>
  Toggle
</button>

{#key key}
  <div
    style="display: flex; flex-direction: column; align-items: flex-start; gap: 48px; margin: 50px;"
  >
    <Popover.Trigger {handle} id="trigger-0" data-testid="trigger-0">Trigger 0</Popover.Trigger>
    {#if showExtraTrigger}
      <Popover.Trigger {handle} id="trigger-1" data-testid="trigger-1">Trigger 1</Popover.Trigger>
    {/if}
  </div>

  <Popover.Root {handle} triggerId="trigger-0" open>
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner" sideOffset={4} align="start">
        <Popover.Popup data-testid="popup">Content</Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
{/key}
