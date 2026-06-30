<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let mode = $state<'old' | 'both' | 'new'>('old')
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add" onclick={() => manager.add({ timeout: 0 })}>add</button>
  <button type="button" data-testid="both" onclick={() => (mode = 'both')}>both</button>
  <button type="button" data-testid="new" onclick={() => (mode = 'new')}>new</button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        {#if mode !== 'new'}
          <Toast.Title id="old-title">Old</Toast.Title>
        {/if}
        {#if mode !== 'old'}
          <Toast.Title id="new-title">New</Toast.Title>
        {/if}
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
