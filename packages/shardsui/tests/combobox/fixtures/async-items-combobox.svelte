<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let items = $state<string[]>(['Apple', 'Banana', 'Cherry'])
  let selectedValue = $state<string | null>(null)
</script>

<Combobox.Root
  {items}
  onValueChange={(value) => {
    selectedValue = value as string | null
  }}
  onOpenChangeComplete={(open) => {
    if (!open && selectedValue) {
      items = [selectedValue]
    }
  }}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
