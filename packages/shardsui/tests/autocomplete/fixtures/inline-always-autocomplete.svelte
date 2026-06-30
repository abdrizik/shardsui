<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  const items = ['apple', 'banana', 'cherry']
</script>

<Autocomplete.Root {items} autoHighlight="always" keepHighlight open inline>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.List>
    <Autocomplete.Collection>
      {#snippet children(item)}
        <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
      {/snippet}
    </Autocomplete.Collection>
  </Autocomplete.List>
</Autocomplete.Root>
<button data-testid="outside">outside</button>
