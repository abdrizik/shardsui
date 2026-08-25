<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Item = { value: string; label: string }

  const a: Item = { value: 'a', label: 'a' }
  const b: Item = { value: 'b', label: 'b' }
  let c: Item | null = null

  let value = $state.raw<Item | null>(a)
  let items = $state.raw<Item[]>([a, b])

  function updateItems() {
    a.label = 'a new'
    c = { value: 'c', label: 'c' }
    items = [a, b, c]
  }
</script>

<div>
  <button onclick={updateItems}>update</button>
  <button onclick={() => c && (value = c)}>select c</button>
  <Combobox.Root bind:value {items}>
    <Combobox.Trigger data-testid="value">
      <Combobox.Value />
    </Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup>
          <Combobox.List>
            {#each items as item (item.value)}
              <Combobox.Item value={item}>{item.label}</Combobox.Item>
            {/each}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</div>
