<script lang="ts">
  import { Popover } from '$lib/components/popover'

  type FinalFocus =
    | boolean
    | HTMLElement
    | ((interactionType: string) => HTMLElement | boolean | null | void)

  let {
    open = false,
    variant = 'ref'
  }: {
    open?: boolean
    variant?: 'ref' | 'fn-element' | 'false' | 'true' | 'null' | 'by-close-type'
  } = $props()

  let finalInput = $state<HTMLInputElement | null>(null)

  const finalFocus = $derived.by<FinalFocus | undefined>(() => {
    switch (variant) {
      case 'ref':
        return finalInput ?? undefined
      case 'fn-element':
        return () => finalInput
      case 'false':
        return false
      case 'true':
        return () => true
      case 'null':
        return () => null
      case 'by-close-type':
        return (type: string) => {
          if (type === 'keyboard') {
            return finalInput
          }
          return true
        }
      default:
        return undefined
    }
  })
</script>

<div>
  <Popover.Root {open}>
    <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup data-testid="popover-popup" {finalFocus}>
          <Popover.Close data-testid="close">Close</Popover.Close>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  <input data-testid="final-input" bind:this={finalInput} />
</div>
