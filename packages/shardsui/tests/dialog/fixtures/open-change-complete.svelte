<script lang="ts">
  import { untrack } from 'svelte'
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained',
    open: initialOpen = false,
    onOpenChangeComplete
  }: {
    arrangement?: 'contained' | 'detached' | 'multiple-detached'
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()

  let open = $state(untrack(() => initialOpen))
</script>

<div>
  <button type="button" onclick={() => (open = false)}>Close externally</button>
  <DialogArrangements {arrangement} bind:open {onOpenChangeComplete} />
</div>
