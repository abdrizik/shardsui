<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type TestItem = { id: number; label: string; label2: string }

  let {
    mode = 'contains' as 'contains' | 'reverse',
    items = [
      { id: 1, label: 'apple', label2: 'one' },
      { id: 2, label: 'orange', label2: 'two' },
      { id: 3, label: 'banana', label2: 'three' }
    ] as TestItem[],
    fruits = ['Apple', 'Banana', 'Zucchini'] as string[],
    autoHighlight = false,
    onItemHighlighted = undefined as ((value: unknown) => void) | undefined
  } = $props()

  let searchValue = $state('')
  let value = $state<TestItem | null>(null)

  function labelToFilter(item: TestItem | null) {
    return item ? `${item.label} ${item.label2}` : ''
  }

  function labelToDisplay(item: TestItem | null) {
    return item ? item.label || item.label2 : ''
  }

  const filteredObjects = $derived(
    items.filter((item) => labelToFilter(item).toLowerCase().includes(searchValue.toLowerCase()))
  )

  const reorderedStrings = $derived(searchValue.length > 0 ? [...fruits].reverse() : fruits)
</script>

{#if mode === 'contains'}
  <Combobox.Root
    items={items as never}
    filteredItems={filteredObjects as never}
    inputValue={searchValue}
    onInputValueChange={(next: string) => (searchValue = next)}
    value={value as never}
    onValueChange={(next: unknown) => (value = next as TestItem | null)}
    itemToStringLabel={labelToDisplay as never}
    isItemEqualToValue={((item: TestItem, v: TestItem) => item?.id === v?.id) as never}
  >
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.Empty data-testid="empty">No items found.</Combobox.Empty>
          <Combobox.List data-testid="list">
            <Combobox.Collection>
              {#snippet children(item: TestItem)}
                <Combobox.Item value={item}>{item.label}</Combobox.Item>
              {/snippet}
            </Combobox.Collection>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{:else}
  <Combobox.Root
    {autoHighlight}
    {onItemHighlighted}
    filteredItems={reorderedStrings as never}
    inputValue={searchValue}
    onInputValueChange={(next: string) => (searchValue = next)}
  >
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            <Combobox.Collection>
              {#snippet children(item: string)}
                <Combobox.Item value={item}>{item}</Combobox.Item>
              {/snippet}
            </Combobox.Collection>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{/if}
