<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  type RootProps = ComponentProps<typeof Combobox.Root>

  let {
    items,
    staticItems,
    value = $bindable(),
    multiple = false,
    autoHighlight = false,
    onItemHighlighted,
    itemToStringLabel
  }: {
    items?: RootProps['items']
    staticItems?: string[]
    value?: RootProps['value']
    multiple?: boolean
    autoHighlight?: boolean
    onItemHighlighted?: RootProps['onItemHighlighted']
    itemToStringLabel?: RootProps['itemToStringLabel']
  } = $props()
</script>

<Combobox.Root
  {items}
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
