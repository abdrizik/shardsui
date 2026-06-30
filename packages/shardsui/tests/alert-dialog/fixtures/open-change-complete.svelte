<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let {
    open = $bindable(false),
    onOpenChangeComplete = undefined
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<div>
  <button data-testid="toggle" onclick={() => (open = !open)}>Toggle</button>
  <AlertDialog.Root bind:open {onOpenChangeComplete}>
    <AlertDialog.Portal>
      <AlertDialog.Popup data-testid="popup" />
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
