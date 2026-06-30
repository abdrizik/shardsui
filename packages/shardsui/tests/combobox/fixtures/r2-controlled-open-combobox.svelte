<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  // `open` never accepts writes from the component: the setter half of the function
  // binding drops them, which is how a strictly controlled overlay is expressed.
  let { open = false, onOpenChange = undefined } = $props()
</script>

<Combobox.Root bind:open={() => open, (next: boolean) => onOpenChange?.(next)}>
  <Combobox.Input data-testid="input" />
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Item value="a">a</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
