<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let { removed = false }: { removed?: boolean } = $props()

  let two = $state<HTMLButtonElement | null>(null)
</script>

<div>
  <Popover.Root>
    <Popover.Trigger data-testid="reference">Open</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="floating" initialFocus={() => two}>
          <button>one</button>
          {#if !removed}
            <button bind:this={two} data-testid="two">two</button>
          {/if}
          <button data-testid="three">three</button>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
