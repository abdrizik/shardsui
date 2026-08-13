<script lang="ts">
  import { AlertDialog } from '@shardsui/svelte/alert-dialog'
  import { Drawer } from '@shardsui/svelte/drawer'

  let drawerOpen = $state(false)
  let confirmationOpen = $state(false)
  let feedback = $state('')
  const titleId = $props.id()
</script>

<Drawer.Root
  swipeDirection="right"
  bind:open={
    () => drawerOpen,
    (open) => {
      // Veto the close by not committing; prompt instead.
      if (!open && feedback) {
        confirmationOpen = true
        return
      }
      drawerOpen = open
    }
  }
>
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Leave feedback
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport
      class="fixed inset-0 flex items-stretch justify-end p-(--viewport-padding) [--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem]"
    >
      <Drawer.Popup
        class="relative -mr-12 h-full w-92 max-w-[calc(100vw-3rem+3rem)] transform-[translateX(var(--drawer-swipe-movement-x))] touch-auto overflow-y-auto overscroll-contain bg-gray-50 p-4 pr-18 text-gray-900 outline-1 outline-gray-200 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem] after:pointer-events-none after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out data-ending-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-swiping:select-none supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-80 supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-lg supports-[-webkit-touch-callout:none]:pr-6 supports-[-webkit-touch-callout:none]:[--bleed:0px] {confirmationOpen
          ? 'after:opacity-100'
          : ''}"
      >
        <Drawer.Content class="mx-auto flex w-full max-w-lg flex-col gap-4">
          <Drawer.Title id={titleId} class="-mt-1.5 text-base font-semibold">Feedback</Drawer.Title>
          <form
            class="flex flex-col gap-4"
            onsubmit={(event) => {
              event.preventDefault()
              feedback = ''
              drawerOpen = false
            }}
          >
            <textarea
              aria-labelledby={titleId}
              required
              class="min-h-32 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
              placeholder="Share your thoughts…"
              bind:value={feedback}></textarea>
            <div class="flex justify-end gap-4">
              <Drawer.Close
                class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
              >
                Cancel
              </Drawer.Close>
              <button
                type="submit"
                class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
              >
                Send
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>

  <AlertDialog.Root bind:open={confirmationOpen}>
    <AlertDialog.Portal>
      <AlertDialog.Popup
        class="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 outline-1 outline-gray-200 transition-[scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <AlertDialog.Title class="-mt-1.5 mb-1 text-base font-semibold"
          >Discard feedback?</AlertDialog.Title
        >
        <AlertDialog.Description class="mb-4 text-sm text-gray-600">
          Your message will be lost.
        </AlertDialog.Description>
        <div class="flex items-center justify-end gap-4">
          <AlertDialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Keep editing
          </AlertDialog.Close>
          <button
            type="button"
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
            onclick={() => {
              confirmationOpen = false
              feedback = ''
              drawerOpen = false
            }}
          >
            Discard
          </button>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</Drawer.Root>
