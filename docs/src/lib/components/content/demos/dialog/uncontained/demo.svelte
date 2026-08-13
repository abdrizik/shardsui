<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    View slides
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-70 backdrop-blur-[2px] transition-[opacity,backdrop-filter] duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Viewport class="fixed inset-0 grid place-items-center px-4 py-12 xl:py-6">
      <Dialog.Popup
        class="group/popup pointer-events-none flex size-full justify-center transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
      >
        <Dialog.Close
          class="pointer-events-auto absolute top-2 right-3 flex size-8 items-center justify-center rounded-md border-0 bg-transparent text-gray-50 hover:bg-gray-50/10 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-50 xl:top-3 xl:right-3"
          aria-label="Close"
        >
          {@render crossIcon()}
        </Dialog.Close>
        <div
          class="pointer-events-auto box-border flex size-full max-w-280 items-center justify-center rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-transform duration-500 ease-out-quint group-data-starting-style/popup:scale-110"
        >
          <Dialog.Title class="sr-only">Slides</Dialog.Title>
        </div>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>

{#snippet crossIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
{/snippet}
