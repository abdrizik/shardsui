<script lang="ts">
  import DialogShapes from './dialog-shapes.svelte'

  let { shape = 'contained' }: { shape?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let showButton = $state(true)
</script>

<DialogShapes {shape} open modal="trap-focus">
  {#if showButton}
    <button type="button" data-testid="remove" onpointerdown={() => (showButton = false)}>
      Remove on pointer down
    </button>
  {/if}
</DialogShapes>
