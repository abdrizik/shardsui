<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Fruit = { id: number; label: string }

  let { onItemHighlighted = undefined } = $props()

  const apple: Fruit = { id: 1, label: 'apple' }
  const banana: Fruit = { id: 2, label: 'banana' }
  const cherry: Fruit = { id: 3, label: 'cherry' }

  let version = $state(0)
  const value = $derived.by<Fruit>(() => {
    void version
    return { id: 2, label: 'banana' }
  })
</script>

<Combobox.Root
  {value}
  isItemEqualToValue={(a, b) => (a as Fruit).id === (b as Fruit).id}
  itemToStringLabel={(item) => (item as Fruit).label}
  {onItemHighlighted}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value={apple}>apple</Combobox.Item>
          <Combobox.Item value={banana}>banana</Combobox.Item>
          <Combobox.Item value={cherry}>cherry</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
<button type="button" data-testid="force" onclick={() => (version += 1)}>force</button>
