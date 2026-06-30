<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { items = ['apple', 'banana'] } = $props()
</script>

<Combobox.Root items={items as never} autoHighlight bind:open={() => false, () => {}}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal keepMounted>
    <Combobox.Positioner>
      <Combobox.Popup>
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
