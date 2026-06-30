<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add-1"
    onclick={() => manager.add({ id: 't1', title: 'One', timeout: 0 })}
  >
    add-1
  </button>
  <button
    type="button"
    data-testid="add-2"
    onclick={() => manager.add({ id: 't2', title: 'Two', timeout: 0 })}
  >
    add-2
  </button>
  <button type="button" data-testid="close-1" onclick={() => manager.close('t1')}>close-1</button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="toast-{toast.id}">
        <Toast.Content data-testid="content-{toast.id}">
          <Toast.Title />
        </Toast.Content>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>

<style>
  :global([data-testid^='toast-']) {
    opacity: 1;
    transition: opacity 10s;
  }

  :global([data-testid^='toast-'][data-ending-style]) {
    opacity: 0;
  }
</style>
