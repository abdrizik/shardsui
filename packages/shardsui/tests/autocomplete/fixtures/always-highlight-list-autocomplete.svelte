<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let { items = ['apple'] }: { items?: readonly string[] } = $props()
</script>

<Autocomplete.Root {items} open autoHighlight="always">
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.List>
    <Autocomplete.Collection>
      {#snippet children(item)}
        <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
      {/snippet}
    </Autocomplete.Collection>
  </Autocomplete.List>
</Autocomplete.Root>
