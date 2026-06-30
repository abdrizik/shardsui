<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { items = ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange'], onOpenChange = undefined } =
    $props()
</script>

<Combobox.Root
  items={items as never}
  bind:open={() => true, (next: boolean) => onOpenChange?.(next)}
>
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Input data-testid="input" />
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
