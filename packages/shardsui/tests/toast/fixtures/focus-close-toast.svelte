<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let count = $state(0)

  function addToast() {
    count += 1
    manager.add({ title: `toast-${count}` })
  }

  function closeMiddleAndNewest() {
    manager.close('middle')
    manager.close('newest')
  }
</script>

<Toast.Provider toastManager={manager} timeout={0}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button
    type="button"
    data-testid="add-oldest"
    onclick={() => manager.add({ id: 'oldest', title: 'oldest' })}>add oldest</button
  >
  <button
    type="button"
    data-testid="add-middle"
    onclick={() => manager.add({ id: 'middle', title: 'middle' })}>add middle</button
  >
  <button
    type="button"
    data-testid="add-newest"
    onclick={() => manager.add({ id: 'newest', title: 'newest' })}>add newest</button
  >
  <button type="button" data-testid="close-middle-and-newest" onclick={closeMiddleAndNewest}
    >close middle and newest</button
  >
  <button type="button" data-testid="close-all" onclick={() => manager.close()}>close all</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Close aria-label="close-press" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
