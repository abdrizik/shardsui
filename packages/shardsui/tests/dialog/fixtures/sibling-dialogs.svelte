<script lang="ts">
  import DialogShapes from './dialog-shapes.svelte'

  let { shape = 'contained' }: { shape?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let openNested = $state(false)
  let openNested2 = $state(false)
</script>

<div>
  <DialogShapes {shape} triggerText="Open base" popupTestId="level-1">
    <button type="button" onclick={() => (openNested = true)}>Open nested 1</button>
  </DialogShapes>

  <DialogShapes {shape} bind:open={openNested} popupTestId="level-2">
    <button type="button" onclick={() => (openNested2 = true)}>Open nested 2</button>
  </DialogShapes>

  <DialogShapes {shape} bind:open={openNested2} popupTestId="level-3">Final nested</DialogShapes>
</div>
