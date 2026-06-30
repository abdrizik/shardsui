<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  const allItems = ['Apple', 'Banana', 'Cherry', 'Date']

  let {
    autoHighlight = false,
    openOnInputClick = false
  }: {
    autoHighlight?: boolean | 'always'
    openOnInputClick?: boolean
  } = $props()

  let value = $state('')

  const filtered = $derived(
    value ? allItems.filter((item) => item.toLowerCase().includes(value.toLowerCase())) : allItems
  )
</script>

<Autocomplete.Root bind:value {autoHighlight} {openOnInputClick}>
  <Autocomplete.Input data-testid="autocomplete-input" />

  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup data-testid="autocomplete-popup">
        <Autocomplete.List data-testid="autocomplete-list">
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
