<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  type RootProps = ComponentProps<typeof Combobox.Root>

  let {
    open = $bindable(),
    value = $bindable(),
    onValueChange,
    onItemHighlighted,
    items = ['apple', 'banana', 'cherry'],
    multiple = false,
    openOnInputClick,
    useItemsProp = true
  }: {
    open?: boolean
    value?: RootProps['value']
    onValueChange?: RootProps['onValueChange']
    onItemHighlighted?: RootProps['onItemHighlighted']
    items?: RootProps['items']
    multiple?: boolean
    openOnInputClick?: boolean
    useItemsProp?: boolean
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
  items={useItemsProp ? items : undefined}
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
