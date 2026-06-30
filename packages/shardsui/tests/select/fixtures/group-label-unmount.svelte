<script lang="ts">
  import { Select } from '$lib/components/select'

  let { labelMounted = true }: { labelMounted?: boolean } = $props()
</script>

<Select.Root open>
  <Select.Group data-testid="group">
    {#if labelMounted}
      <Select.GroupLabel id="group-label">Fruits</Select.GroupLabel>
    {/if}
  </Select.Group>
</Select.Root>
