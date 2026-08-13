<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  let initialFocus = $state<HTMLElement | null>(null)
  let finalFocus = $state<HTMLElement | null>(null)
</script>

<div class="flex flex-wrap justify-center gap-3">
  <Dialog.Root>
    <Dialog.Trigger
      class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
      >Open feedback</Dialog.Trigger
    >
    <Dialog.Portal>
      <Dialog.Backdrop
        class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
      />
      <Dialog.Popup
        initialFocus={() => initialFocus}
        finalFocus={() => finalFocus}
        class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-1/2 flex-col gap-4 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
      >
        <div class="flex flex-col gap-1">
          <Dialog.Title class="text-base font-semibold">Feedback form</Dialog.Title>
          <Dialog.Description class="text-sm text-gray-600">
            Focus starts on Feedback, and returns to the button beside the trigger.
          </Dialog.Description>
        </div>
        <label class="flex flex-col items-start gap-1 text-sm">
          Full name
          <input
            class="h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950"
            placeholder="Enter your name"
          />
        </label>
        <label class="flex flex-col items-start gap-1 text-sm">
          Feedback
          <input
            bind:this={initialFocus}
            class="h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950"
            placeholder="Enter your feedback"
          />
        </label>
        <div class="flex justify-end">
          <Dialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
            >Close</Dialog.Close
          >
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <button
    bind:this={finalFocus}
    type="button"
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    >Final focus</button
  >
</div>
