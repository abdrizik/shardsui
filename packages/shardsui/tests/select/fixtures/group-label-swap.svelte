<script lang="ts">
  import { Select } from '$lib/components/select'

  let { labels = 'old' }: { labels?: 'old' | 'both' | 'new' } = $props()
</script>

<Select.Root open>
  <Select.Group data-testid="group">
    {#if labels !== 'new'}
      <Select.GroupLabel id="old-label">Old</Select.GroupLabel>
    {/if}
    {#if labels !== 'old'}
      <Select.GroupLabel id="new-label">New</Select.GroupLabel>
    {/if}
  </Select.Group>
</Select.Root>
