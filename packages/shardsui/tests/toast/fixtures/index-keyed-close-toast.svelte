<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
  let count = $state(0)
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add"
    onclick={() => {
      count += 1
      manager.add({ title: `Toast ${count}`, timeout: 0 })
    }}
  >
    add
  </button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast, index (index)}
      <Toast.Root {toast} data-testid="root-{index}">
        <Toast.Title data-testid="title-{index}" />
        <Toast.Close data-testid="close-{index}">close</Toast.Close>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
