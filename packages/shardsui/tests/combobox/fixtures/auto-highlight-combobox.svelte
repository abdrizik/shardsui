<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    open = $bindable(),
    value = $bindable(),
    onValueChange = undefined,
    onItemHighlighted = undefined,
    items = ['apple', 'banana', 'cherry'] as readonly unknown[],
    multiple = false,
    openOnInputClick = undefined as boolean | undefined,
    useItemsProp = true
  } = $props()
</script>

<Combobox.Root
  {open}
  {value}
  {onValueChange}
  {onItemHighlighted}
  {multiple}
  {openOnInputClick}
  autoHighlight
  items={useItemsProp ? (items as never) : (undefined as never)}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        {#if useItemsProp}
          <ItemsList />
        {:else}
          <Combobox.List data-testid="list">
            <Combobox.Item value="alpha">alpha</Combobox.Item>
            <Combobox.Item value="alphabet">alphabet</Combobox.Item>
            <Combobox.Item value="beta">beta</Combobox.Item>
          </Combobox.List>
        {/if}
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
