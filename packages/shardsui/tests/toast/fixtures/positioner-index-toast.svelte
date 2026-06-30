<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager} timeout={0}>
  <button
    type="button"
    data-testid="add-oldest"
    onclick={() => manager.add({ id: 'oldest', title: 'oldest' })}>add oldest</button
  >
  <button
    type="button"
    data-testid="add-newest"
    onclick={() => manager.add({ id: 'newest', title: 'newest' })}>add newest</button
  >
  <button type="button" data-testid="close-newest" onclick={() => manager.close('newest')}
    >close newest</button
  >
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Positioner {toast} data-testid={toast.id}>{toast.title}</Toast.Positioner>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
