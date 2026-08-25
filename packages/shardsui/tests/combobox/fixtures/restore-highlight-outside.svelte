<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  type RootProps = ComponentProps<typeof Combobox.Root>

  let {
    items = ['apple', 'banana', 'cherry'],
    value = $bindable(),
    open = $bindable(false),
    multiple = false,
    autoHighlight = false,
    keepMounted = false,
    controlled = false
  }: {
    items?: RootProps['items']
    value?: RootProps['value']
    open?: boolean
    multiple?: boolean
    autoHighlight?: boolean
    keepMounted?: boolean
    controlled?: boolean
  } = $props()
</script>

<Combobox.Root
  {items}
  bind:value={
    () => value,
    (next: unknown) => {
      if (!controlled) value = next
    }
  }
  bind:open
  {multiple}
  {autoHighlight}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal {keepMounted}>
    <Combobox.Positioner>
      <Combobox.Popup>
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
