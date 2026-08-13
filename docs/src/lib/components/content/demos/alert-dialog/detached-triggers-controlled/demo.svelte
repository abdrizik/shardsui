<script lang="ts">
  import { AlertDialog } from '@shardsui/svelte/alert-dialog'

  const confirm = new AlertDialog.Handle<{ title: string; body: string }>()

  let open = $state(false)
  let triggerId = $state<string | null>(null)

  const actions = [
    {
      id: 'discard-draft',
      label: 'Discard draft',
      payload: {
        title: 'Discard draft?',
        body: "This can't be undone."
      }
    },
    {
      id: 'delete-account',
      label: 'Delete account',
      payload: {
        title: 'Delete account?',
        body: 'Your profile and data will be permanently removed.'
      }
    }
  ]
</script>

<div class="flex flex-wrap justify-center gap-2">
  {#each actions as action (action.id)}
    <AlertDialog.Trigger
      class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-red-800 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
      handle={confirm}
      id={action.id}
      payload={action.payload}
    >
      {action.label}
    </AlertDialog.Trigger>
  {/each}

  <button
    type="button"
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={() => {
      triggerId = 'delete-account'
      open = true
    }}
  >
    Open programmatically
  </button>
</div>

<AlertDialog.Root
  handle={confirm}
  bind:open
  bind:triggerId
  onOpenChange={(isOpen) => {
    if (!isOpen) triggerId = null
  }}
>
  {#snippet children({ payload })}
    <AlertDialog.Portal>
      <AlertDialog.Backdrop
        class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
      />
      <AlertDialog.Popup
        class="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
      >
        <AlertDialog.Title class="mb-1 text-base font-semibold">
          {payload?.title ?? 'Are you sure?'}
        </AlertDialog.Title>
        <AlertDialog.Description class="mb-4 text-sm text-gray-600">
          {payload?.body ?? 'This action cannot be undone.'}
        </AlertDialog.Description>
        <div class="flex justify-end gap-3">
          <AlertDialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Cancel
          </AlertDialog.Close>
          <AlertDialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-red-800 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Confirm
          </AlertDialog.Close>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  {/snippet}
</AlertDialog.Root>
