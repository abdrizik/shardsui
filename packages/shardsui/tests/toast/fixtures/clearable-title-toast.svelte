<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add"
    onclick={() => manager.add({ id: 'test', title: 'Toast title', timeout: 0 })}
  >
    add
  </button>
  <button type="button" data-testid="clear" onclick={() => manager.update('test', { title: '' })}>
    clear
  </button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
