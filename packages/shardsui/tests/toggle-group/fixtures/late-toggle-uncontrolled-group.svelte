<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'

  let { showLate = false }: { showLate?: boolean } = $props()
</script>

<ToggleGroup>
  <Toggle>First</Toggle>
  {#if showLate}
    <Toggle>Late</Toggle>
  {/if}
</ToggleGroup>
