<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    open = false,
    onInteractionType
  }: {
    open?: boolean
    onInteractionType?: (type: string) => void
  } = $props()

  let input2 = $state<HTMLInputElement | null>(null)

  function initialFocus(type: string): HTMLElement | boolean | null | void {
    onInteractionType?.(type)
    if (type === 'keyboard') {
      return input2
    }
    return undefined
  }
</script>

<div>
  <Popover.Root {open}>
    <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="popover-popup" {initialFocus}>
          <input data-testid="input-1" />
          <input data-testid="input-2" bind:this={input2} />
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
