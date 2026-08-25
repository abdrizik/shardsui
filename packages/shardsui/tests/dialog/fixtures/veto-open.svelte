<script lang="ts">
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained'
  }: { arrangement?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let open = $state(false)
</script>

<DialogArrangements
  {arrangement}
  bind:open={
    () => open,
    (next) => {
      if (!next) open = false
    }
  }
/>
