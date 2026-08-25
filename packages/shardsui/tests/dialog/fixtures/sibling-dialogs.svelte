<script lang="ts">
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained'
  }: { arrangement?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let openNested = $state(false)
  let openNested2 = $state(false)
</script>

<div>
  <DialogArrangements {arrangement} triggerText="Open base" popupTestId="level-1">
    <button type="button" onclick={() => (openNested = true)}>Open nested 1</button>
  </DialogArrangements>

  <DialogArrangements {arrangement} bind:open={openNested} popupTestId="level-2">
    <button type="button" onclick={() => (openNested2 = true)}>Open nested 2</button>
  </DialogArrangements>

  <DialogArrangements {arrangement} bind:open={openNested2} popupTestId="level-3"
    >Final nested</DialogArrangements
  >
</div>
