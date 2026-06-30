<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let showToasts = $state(true)
  let longTitle = $state(false)

  function show() {
    longTitle = true
    showToasts = true
  }
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add-button"
    onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}>add</button
  >
  <button type="button" data-testid="hide-button" onclick={() => (showToasts = false)}>hide</button>
  <button type="button" data-testid="show-button" onclick={show}>show</button>
  <Toast.Viewport data-testid="viewport">
    {#if showToasts}
      {#each Toast.getToastManager().toasts as toast (toast.id)}
        <Toast.Root {toast} data-testid="toast-root" style="width: 30px">
          <Toast.Title>
            {longTitle ? 'This title is much longer than before' : toast.title}
          </Toast.Title>
        </Toast.Root>
      {/each}
    {/if}
  </Toast.Viewport>
</Toast.Provider>
