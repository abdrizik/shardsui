<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle<string> } = $props()
</script>

<Popover.Trigger {handle} id="trigger-1" payload="first" data-testid="trigger1"
  >Trigger 1</Popover.Trigger
>
<Popover.Trigger {handle} id="trigger-2" payload="second" data-testid="trigger2"
  >Trigger 2</Popover.Trigger
>

<Popover.Root {handle}>
  {#snippet children({ payload })}
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="popup">
          <Popover.Viewport>
            {#if payload === 'first'}
              <div data-testid="payload-1">Preview 1</div>
            {/if}
            {#if payload === 'second'}
              <div data-testid="payload-2">Preview 2</div>
            {/if}
          </Popover.Viewport>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>
