<script lang="ts">
  let { action }: { action: () => void } = $props()

  $effect.pre(() => {
    action()
  })
</script>
