<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  const itemDialog = new Dialog.Handle<string>()

  let open = $state(false)
  let triggerId = $state<string | null>(null)

  const items = [
    { id: 'item-design-systems', payload: 'Design Systems' },
    { id: 'item-motion', payload: 'Motion' }
  ]
</script>

<div class="flex flex-wrap justify-center gap-2">
  {#each items as item (item.id)}
    <Dialog.Trigger
      class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
      handle={itemDialog}
      id={item.id}
      payload={item.payload}
    >
      {item.payload}
    </Dialog.Trigger>
  {/each}

  <button
    type="button"
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={() => {
      triggerId = 'item-motion'
      open = true
    }}
  >
    Open Motion
  </button>
</div>

<Dialog.Root
  handle={itemDialog}
  bind:open
  bind:triggerId
  onOpenChange={(isOpen) => {
    if (!isOpen) triggerId = null
  }}
>
  {#snippet children({ payload })}
    <Dialog.Portal>
      <Dialog.Backdrop
        class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
      />
      <Dialog.Popup
        class="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
      >
        <Dialog.Title class="mb-1 text-base font-semibold">{payload}</Dialog.Title>
        <Dialog.Description class="mb-4 text-sm text-gray-600">
          Opened from the {payload} trigger.
        </Dialog.Description>
        <div class="flex justify-end gap-3">
          <Dialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Close
          </Dialog.Close>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
