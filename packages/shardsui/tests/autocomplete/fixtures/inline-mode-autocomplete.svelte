<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  type Mode = 'list' | 'both' | 'inline' | 'none'

  const allItems = ['apple', 'banana', 'cherry']

  let {
    mode = 'list' as Mode,
    openOnInputClick = false
  }: {
    mode?: Mode
    openOnInputClick?: boolean
  } = $props()

  const staticMode = $derived(mode === 'inline' || mode === 'none')
  let value = $state('')
  const filtered = $derived(
    staticMode
      ? allItems
      : value
        ? allItems.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        : allItems
  )
</script>

<Autocomplete.Root bind:value {mode} {openOnInputClick}>
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
