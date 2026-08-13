<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'
  import { AlertDialog } from '@shardsui/svelte/alert-dialog'

  let dialogOpen = $state(false)
  let confirmationOpen = $state(false)
  let noteValue = $state('')
  const titleId = $props.id()
</script>

<Dialog.Root
  bind:open={
    () => dialogOpen,
    (open) => {
      // Veto the close by not committing; prompt instead.
      if (!open && noteValue) {
        confirmationOpen = true
        return
      }
      noteValue = ''
      dialogOpen = open
    }
  }
>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Add note
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Popup
      class="fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-1/2 scale-[calc(1-0.1*var(--nested-dialogs))] flex-col gap-1 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[top,scale,opacity] duration-100 ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out data-ending-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
    >
      <Dialog.Title id={titleId} class="text-base font-semibold">Note</Dialog.Title>
      <form
        class="flex flex-col gap-4"
        onsubmit={(e) => {
          e.preventDefault()
          dialogOpen = false
        }}
      >
        <textarea
          aria-labelledby={titleId}
          required
          class="min-h-32 w-full rounded-md border border-gray-200 p-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
          placeholder="Capture a key takeaway…"
          bind:value={noteValue}></textarea>
        <div class="flex justify-end gap-3">
          <Dialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Cancel
          </Dialog.Close>
          <button
            type="submit"
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Save
          </button>
        </div>
      </form>
    </Dialog.Popup>
  </Dialog.Portal>

  <AlertDialog.Root bind:open={confirmationOpen}>
    <AlertDialog.Portal>
      <AlertDialog.Popup
        class="fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-1/2 scale-[calc(1-0.1*var(--nested-dialogs))] rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[top,scale,opacity] duration-100 ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out data-ending-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
      >
        <AlertDialog.Title class="mb-1 text-base font-semibold">Discard note?</AlertDialog.Title>
        <AlertDialog.Description class="mb-4 text-sm text-gray-600">
          Your draft will be lost.
        </AlertDialog.Description>
        <div class="flex items-center justify-end gap-3">
          <AlertDialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Go back
          </AlertDialog.Close>
          <button
            type="button"
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
            onclick={() => {
              confirmationOpen = false
              dialogOpen = false
            }}
          >
            Discard
          </button>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</Dialog.Root>
