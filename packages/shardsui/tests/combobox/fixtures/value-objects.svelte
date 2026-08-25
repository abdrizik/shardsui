<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    items,
    multiple = false,
    placeholder,
    itemToStringLabel,
    grouped = false,
    inputInsidePopup = false
  }: {
    value?: unknown
    items?: readonly unknown[]
    multiple?: boolean
    placeholder?: string
    itemToStringLabel?: (item: unknown) => string
    grouped?: boolean
    inputInsidePopup?: boolean
  } = $props()

  function labelOf(item: unknown): string {
    if (item instanceof Object && 'label' in item) {
      const l = item.label
      return l == null ? '' : String(l)
    }
    return String(item)
  }

  function itemsOf(group: unknown): readonly unknown[] {
    return group instanceof Object && 'items' in group && Array.isArray(group.items)
      ? group.items
      : []
  }
</script>

<Combobox.Root {value} {multiple} {items} {itemToStringLabel}>
  <Combobox.Trigger data-testid="value">
    <Combobox.Value {placeholder} />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        {#if inputInsidePopup}
          <Combobox.Input placeholder="e.g. United Kingdom" />
        {/if}
        <Combobox.List>
          {#if grouped && items}
            {#each items as group, gi (gi)}
              <Combobox.Group items={itemsOf(group)}>
                {#each itemsOf(group) as item, ii (ii)}
                  <Combobox.Item value={item}>{labelOf(item)}</Combobox.Item>
                {/each}
              </Combobox.Group>
            {/each}
          {:else if items}
            {#each items as item, i (i)}
              <Combobox.Item value={item}>{labelOf(item)}</Combobox.Item>
            {/each}
          {/if}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
