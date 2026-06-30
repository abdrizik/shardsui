<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    limit = 3
  }: {
    limit?: number
  } = $props()

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({ title: 'title', description: 'description' })
  }
</script>

<Toast.Provider toastManager={manager} {limit}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Description data-testid="description">{toast.description}</Toast.Description>
        <Toast.Close aria-label="close-press" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
