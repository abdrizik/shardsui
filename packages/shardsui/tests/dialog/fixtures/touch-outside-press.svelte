<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  let {
    open = true,
    onOpenChange = undefined,
    modal = false
  }: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    modal?: boolean | 'trap-focus'
  } = $props()
</script>

<div>
  <button data-testid="outside">Outside</button>
  <Dialog.Root {open} {modal} {onOpenChange}>
    <Dialog.Portal>
      <Dialog.Popup data-testid="dialog-popup">Dialog</Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</div>
