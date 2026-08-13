<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Edit plan
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Popup
      class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] [translate:-50%_calc(-50%+1.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] flex-col gap-4 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[translate,scale,opacity] duration-100 ease-[cubic-bezier(0,0,0.58,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-[cubic-bezier(0,0,0.58,1)] data-ending-style:[translate:-50%_calc(-50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:[translate:-50%_calc(-50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
    >
      <div class="flex flex-col gap-1">
        <Dialog.Title class="text-base font-semibold">Edit plan</Dialog.Title>
        <Dialog.Description class="text-sm text-gray-600">
          Set your weekly goal and schedule.
        </Dialog.Description>
      </div>
      <div class="flex items-center justify-end gap-3">
        <Dialog.Root>
          <Dialog.Trigger
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Manage reminders
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Popup
              class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] [translate:-50%_calc(-50%+1.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] flex-col gap-4 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[translate,scale,opacity] duration-100 ease-[cubic-bezier(0,0,0.58,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-[cubic-bezier(0,0,0.58,1)] data-ending-style:[translate:-50%_calc(-50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:[translate:-50%_calc(-50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
            >
              <div class="flex flex-col gap-1">
                <Dialog.Title class="text-base font-semibold">Reminders</Dialog.Title>
                <Dialog.Description class="text-sm text-gray-600">
                  You have 2 daily reminders set.
                </Dialog.Description>
              </div>
              <div class="flex items-center justify-end gap-3">
                <Dialog.Close
                  class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                >
                  Close
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
