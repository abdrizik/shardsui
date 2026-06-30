<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let open = $state(false)
  let showTrigger = $state(true)
</script>

<div>
  <button type="button" data-testid="fallback">Focus fallback</button>

  <Popover.Root
    {open}
    onOpenChange={(nextOpen: boolean) => {
      if (nextOpen) {
        showTrigger = false
      }
      open = nextOpen
    }}
  >
    {#if showTrigger}
      <Popover.Trigger
        data-testid="trigger"
        onmousedown={(event: MouseEvent) => event.preventDefault()}
      >
        Disappearing trigger
      </Popover.Trigger>
    {/if}

    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup>
          <span data-testid="content">Content</span>
          <Popover.Close data-testid="close">Close</Popover.Close>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
