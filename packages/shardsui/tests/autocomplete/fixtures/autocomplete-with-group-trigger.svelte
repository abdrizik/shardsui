<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  const allItems = ['alpha', 'beta']

  let value = $state('')

  const filtered = $derived(
    value ? allItems.filter((item) => item.toLowerCase().includes(value.toLowerCase())) : allItems
  )
</script>

<Autocomplete.Root bind:value openOnInputClick>
  <Autocomplete.InputGroup data-testid="group">
    <Autocomplete.Input data-testid="input" />
    <Autocomplete.Trigger data-testid="trigger" />
  </Autocomplete.InputGroup>
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {#each filtered as item (item)}
            <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
          {/each}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
