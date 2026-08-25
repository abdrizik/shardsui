<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    multiple = false,
    value = $bindable(),
    onValueChange,
    items = ['apple', 'apricot', 'banana']
  }: {
    multiple?: boolean
    value?: unknown
    onValueChange?: (value: unknown) => void
    items?: string[]
  } = $props()
</script>

<Combobox.Root {items} {multiple} bind:value {onValueChange}>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup" aria-label="Demo">
        <Combobox.Input data-testid="input" aria-label="Combobox input" />
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
