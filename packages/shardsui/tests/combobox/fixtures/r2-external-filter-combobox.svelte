<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'

  type TestItem = { id: number; label: string; label2: string }

  let {
    mode = 'contains',
    items = [
      { id: 1, label: 'apple', label2: 'one' },
      { id: 2, label: 'orange', label2: 'two' },
      { id: 3, label: 'banana', label2: 'three' }
    ],
    fruits = ['Apple', 'Banana', 'Zucchini'],
    autoHighlight = false,
    onItemHighlighted
  }: {
    mode?: 'contains' | 'reverse'
    items?: TestItem[]
    fruits?: string[]
    autoHighlight?: boolean
    onItemHighlighted?: ComponentProps<typeof Combobox.Root>['onItemHighlighted']
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
    {items}
    filteredItems={filteredObjects}
    inputValue={searchValue}
    onInputValueChange={(next: string) => (searchValue = next)}
    {value}
    onValueChange={(next) => (value = next)}
    itemToStringLabel={labelToDisplay}
    isItemEqualToValue={(item, v) => item?.id === v?.id}
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
    filteredItems={reorderedStrings}
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
