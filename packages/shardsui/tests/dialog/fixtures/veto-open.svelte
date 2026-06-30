<script lang="ts">
  import DialogShapes from './dialog-shapes.svelte'

  let { shape = 'contained' }: { shape?: 'contained' | 'detached' | 'multiple-detached' } = $props()

  let open = $state(false)
</script>

<DialogShapes
  {shape}
  bind:open={
    () => open,
    (next) => {
      if (!next) open = false
    }
  }
/>
