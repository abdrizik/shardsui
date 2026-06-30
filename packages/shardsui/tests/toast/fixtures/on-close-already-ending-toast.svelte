<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    onClose1 = undefined,
    onClose2 = undefined
  }: {
    onClose1?: () => void
    onClose2?: () => void
  } = $props()

  const manager = new Toast.Manager()
  let toast1Id = $state<string | null>(null)

  function handleClose1() {
    onClose1?.()
    manager.close()
  }

  function addToasts() {
    toast1Id = manager.add({ title: 'toast 1', timeout: 0, onClose: handleClose1 })
    manager.add({ title: 'toast 2', timeout: 0, onClose: onClose2 })
  }

  function closeToast1() {
    if (toast1Id) manager.close(toast1Id)
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToasts}>add</button>
  <button type="button" data-testid="close-button" onclick={closeToast1}>close</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Close aria-label="close-press" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
