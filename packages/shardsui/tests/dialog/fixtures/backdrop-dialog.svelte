<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  let {
    open = true,
    includeNestedBackdrop = false,
    nestedOpen = true,
    modal = false,
    onOpenChange
  }: {
    open?: boolean
    includeNestedBackdrop?: boolean
    nestedOpen?: boolean
    modal?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Dialog.Root {open} {modal} {onOpenChange}>
  <Dialog.Backdrop data-testid="root-backdrop" />
  <Dialog.Portal>
    <Dialog.Popup>
      Root dialog
      {#if includeNestedBackdrop}
        <Dialog.Root open={nestedOpen}>
          <Dialog.Backdrop data-testid="nested-backdrop" />
          <Dialog.Portal>
            <Dialog.Popup>Nested dialog</Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      {/if}
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
