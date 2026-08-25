<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(),
    inputValue = $bindable(),
    openOnInputClick,
    items = ['apple']
  }: {
    open?: boolean
    inputValue?: string
    openOnInputClick?: boolean
    items?: readonly string[]
  } = $props()
</script>

<Combobox.Root {open} {inputValue} {openOnInputClick} {items} filter={null}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each items as item (item)}
            <Combobox.Item value={item}>{item}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
