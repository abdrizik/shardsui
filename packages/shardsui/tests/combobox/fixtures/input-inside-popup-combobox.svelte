<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    multiple = false,
    value = $bindable(),
    onValueChange = undefined,
    items = ['apple', 'apricot', 'banana'] as string[]
  } = $props()
</script>

<Combobox.Root items={items as never} {multiple} bind:value {onValueChange}>
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
