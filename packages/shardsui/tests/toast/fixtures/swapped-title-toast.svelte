<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let swapped = $state(false)
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add" onclick={() => manager.add({ timeout: 0 })}>add</button>
  <button type="button" data-testid="swap" onclick={() => (swapped = !swapped)}>swap</button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        {#if swapped}
          <Toast.Title data-testid="title">B</Toast.Title>
        {:else}
          <Toast.Title data-testid="title">A</Toast.Title>
        {/if}
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
