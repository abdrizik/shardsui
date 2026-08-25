<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Language = { id: string; value: string }

  let {
    value = $bindable(),
    onValueChange,
    languages = [
      { id: 'js', value: 'JavaScript' },
      { id: 'ts', value: 'TypeScript' },
      { id: 'py', value: 'Python' },
      { id: 'rb', value: 'Ruby' }
    ]
  }: {
    value?: Language[] | null
    onValueChange?: (value: Language[] | null) => void
    languages?: Language[]
  } = $props()
</script>

<Combobox.Root
  multiple
  {value}
  {onValueChange}
  items={languages}
  itemToStringLabel={(item: Language) => item.value}
  itemToStringValue={(item: Language) => item.id}
  isItemEqualToValue={(item: Language, v: Language) => item.id === v.id}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each languages as language (language.id)}
            <Combobox.Item value={language}>{language.value}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
