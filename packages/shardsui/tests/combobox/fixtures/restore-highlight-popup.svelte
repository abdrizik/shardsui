<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    items = undefined as readonly unknown[] | undefined,
    staticItems = undefined as string[] | undefined,
    value = $bindable(),
    multiple = false,
    autoHighlight = false,
    onItemHighlighted = undefined,
    itemToStringLabel = undefined as ((item: unknown) => string) | undefined
  } = $props()
</script>

<Combobox.Root
  items={items as never}
  bind:value
  {multiple}
  {autoHighlight}
  {onItemHighlighted}
  {itemToStringLabel}
>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Input data-testid="input" aria-label="Search" />
        {#if staticItems}
          <Combobox.List data-testid="list">
            {#each staticItems as item (item)}
              <Combobox.Item value={item}>{item}</Combobox.Item>
            {/each}
          </Combobox.List>
        {:else}
          <ItemsList label={itemToStringLabel ?? ((item) => String(item))} />
        {/if}
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
