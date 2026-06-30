<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    open = false,
    initialFocus = undefined,
    finalFocus = undefined,
    useSecondInput = false
  }: {
    open?: boolean
    initialFocus?:
      | boolean
      | HTMLElement
      | ((interactionType: string) => HTMLElement | boolean | null | void)
    finalFocus?:
      | boolean
      | HTMLElement
      | ((interactionType: string) => HTMLElement | boolean | null | void)
    useSecondInput?: boolean
  } = $props()

  let input2 = $state<HTMLInputElement | null>(null)

  const resolvedInitialFocus = $derived(
    initialFocus === undefined && useSecondInput ? (input2 ?? undefined) : initialFocus
  )
</script>

<div>
  <input data-testid="outside-before" />
  <Popover.Root {open}>
    <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="popover-popup" initialFocus={resolvedInitialFocus} {finalFocus}>
          <input data-testid="input-1" />
          <input data-testid="input-2" bind:this={input2} />
          <input data-testid="input-3" />
          <button data-testid="popup-close">Close</button>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <input data-testid="outside-after" />
</div>
