<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add"
    onclick={() => manager.add({ title: 'Saved', timeout: 0 })}
  >
    add
  </button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast, index (index)}
      <Toast.Root {toast} data-testid="root-{index}" swipeDirection="right">
        <Toast.Title />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>

<style>
  :global([data-testid^='root-']) {
    opacity: 1;
    transition: opacity 10s;
  }

  :global([data-testid^='root-'][data-ending-style]) {
    opacity: 0;
  }
</style>
