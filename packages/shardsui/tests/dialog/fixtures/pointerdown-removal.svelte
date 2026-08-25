<script lang="ts">
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained'
  }: { arrangement?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let showButton = $state(true)
</script>

<DialogArrangements {arrangement} open modal="trap-focus">
  {#if showButton}
    <button type="button" data-testid="remove" onpointerdown={() => (showButton = false)}>
      Remove on pointer down
    </button>
  {/if}
</DialogArrangements>
