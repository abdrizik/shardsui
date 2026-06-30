<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let { sideOffset = 0 }: { sideOffset?: number } = $props()

  const manager = new Toast.Manager()

  let anchor = $state<HTMLButtonElement | null>(null)

  function addToast() {
    manager.add({
      id: 'anchored',
      title: 'title',
      timeout: 0,
      positionerProps: { anchor, side: 'bottom', sideOffset }
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    bind:this={anchor}
    style="position: absolute; top: 200px; left: 100px; width: 80px; height: 20px;"
    onclick={addToast}>anchor</button
  >
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Positioner {toast} data-testid={toast.id}>
        <Toast.Root {toast}>
          <Toast.Arrow data-testid="arrow" />
          <Toast.Title>{toast.title}</Toast.Title>
        </Toast.Root>
      </Toast.Positioner>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
