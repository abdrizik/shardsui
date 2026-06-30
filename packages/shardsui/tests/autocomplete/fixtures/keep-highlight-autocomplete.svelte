<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  const allItems = ['apple', 'banana', 'cherry']

  let {
    keepHighlight = false,
    autoHighlight = false
  }: {
    keepHighlight?: boolean
    autoHighlight?: boolean | 'always'
  } = $props()

  let value = $state('')
  const filtered = $derived(
    value ? allItems.filter((item) => item.toLowerCase().includes(value.toLowerCase())) : allItems
  )
</script>

<Autocomplete.Root bind:value {keepHighlight} {autoHighlight} openOnInputClick>
  <Autocomplete.Input data-testid="autocomplete-input" />

  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {#each filtered as item (item)}
            <Autocomplete.Item value={item}>
              {item}
            </Autocomplete.Item>
          {/each}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
