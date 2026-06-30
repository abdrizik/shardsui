<script lang="ts">
  import { Toast } from '$lib/components/toast'
  import { Dialog } from '$lib/components/dialog'

  let {
    open = $bindable(false)
  }: {
    open?: boolean
  } = $props()

  const manager = new Toast.Manager()

  function addNormal() {
    manager.add({ title: 'Toast in dialog', description: 'This toast is in a dialog' })
  }

  function addHigh() {
    manager.add({ title: 'High priority toast', description: 'This is urgent', priority: 'high' })
  }
</script>

<Toast.Provider toastManager={manager}>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="toast-root">
        <Toast.Title data-testid="toast-title">{toast.title}</Toast.Title>
        <Toast.Description data-testid="toast-description">{toast.description}</Toast.Description>
        <Toast.Close aria-label="close" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>

  <button type="button" data-testid="open-dialog" onclick={() => (open = true)}>open dialog</button>

  <Dialog.Root bind:open>
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Popup>
        <button type="button" data-testid="add" onclick={addNormal}>add</button>
        <button type="button" data-testid="add-high" onclick={addHigh}>add high</button>
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</Toast.Provider>
