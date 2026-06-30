<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { labels = 'old' as 'old' | 'both' | 'new' } = $props()
</script>

<Combobox.Root open>
  <Combobox.Group data-testid="group">
    {#if labels !== 'new'}
      <Combobox.GroupLabel id="old-label">Old</Combobox.GroupLabel>
    {/if}
    {#if labels !== 'old'}
      <Combobox.GroupLabel id="new-label">New</Combobox.GroupLabel>
    {/if}
  </Combobox.Group>
</Combobox.Root>
