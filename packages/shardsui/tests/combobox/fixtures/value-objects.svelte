<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    items = undefined as unknown[] | undefined,
    multiple = false,
    placeholder = undefined as string | undefined,
    itemToStringLabel = undefined as ((item: unknown) => string) | undefined,
    grouped = false,
    inputInsidePopup = false
  } = $props()

  function labelOf(item: unknown): string {
    if (item && typeof item === 'object' && 'label' in (item as Record<string, unknown>)) {
      const l = (item as Record<string, unknown>).label
      return l == null ? '' : String(l)
    }
    return String(item)
  }
</script>

<Combobox.Root
  {value}
  {multiple}
  items={items as never}
  itemToStringLabel={itemToStringLabel as never}
>
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
              <Combobox.Group items={(group as { items: unknown[] }).items as never}>
                {#each (group as { items: unknown[] }).items as item, ii (ii)}
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
