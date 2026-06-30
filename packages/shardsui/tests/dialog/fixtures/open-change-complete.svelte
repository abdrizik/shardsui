<script lang="ts">
  import { untrack } from 'svelte'
  import DialogShapes from './dialog-shapes.svelte'

  let {
    shape = 'contained',
    open: initialOpen = false,
    onOpenChangeComplete = undefined
  }: {
    shape?: 'contained' | 'detached' | 'multiple-detached'
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()

  let open = $state(untrack(() => initialOpen))
</script>

<div>
  <button type="button" onclick={() => (open = false)}>Close externally</button>
  <DialogShapes {shape} bind:open {onOpenChangeComplete} />
</div>
