<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    name = 'test',
    onValueChange = undefined,
    onInputValueChange = undefined,
    options = [
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' }
    ]
  }: {
    name?: string
    onValueChange?: (value: unknown) => void
    onInputValueChange?: (value: string) => void
    options?: { value: string; label: string | null }[]
  } = $props()
</script>

<Combobox.Root {name} {onValueChange} {onInputValueChange}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each options as option (option.value)}
            <Combobox.Item value={option.value}>{option.label}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
