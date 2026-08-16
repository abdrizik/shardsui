<script lang="ts">
  import type { PreventableEvent } from '$lib'
  import { Dialog } from '$lib/components/dialog'

  type Props = {
    open?: boolean
    keepMounted?: boolean
    onOpenChange?: (open: boolean) => void
    onclick?: (event: MouseEvent & PreventableEvent) => void
    preventCloseHandler?: boolean
  }

  let {
    open = false,
    keepMounted = false,
    onOpenChange,
    onclick,
    preventCloseHandler = false
  }: Props = $props()

  function handleClick(event: MouseEvent & PreventableEvent) {
    onclick?.(event)
    if (preventCloseHandler) event.preventShardsUIHandler()
  }
</script>

<Dialog.Root {open} modal={false} {onOpenChange}>
  <Dialog.Portal {keepMounted}>
    <Dialog.Popup>
      <Dialog.Close onclick={handleClick}>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
