<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import { Toolbar } from '$lib/components/toolbar'

  let { content = 'button' }: { content?: 'button' | 'input' } = $props()

  let toolbar = $state<HTMLElement | null>(null)
</script>

<Toolbar.Root bind:ref={toolbar} data-testid="toolbar">
  <Toolbar.Button data-testid="first">First</Toolbar.Button>
  <Popover.Root>
    <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
    <Popover.Portal container={toolbar}>
      <Popover.Positioner>
        <Popover.Popup data-testid="popup">
          {#if content === 'input'}
            <input data-testid="inside" value="ab" />
          {:else}
            <button type="button" data-testid="inside">Inside</button>
          {/if}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <Toolbar.Button data-testid="last">Last</Toolbar.Button>
</Toolbar.Root>
