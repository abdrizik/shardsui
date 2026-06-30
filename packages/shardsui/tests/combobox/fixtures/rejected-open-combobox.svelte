<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { onOpenChange = undefined }: { onOpenChange?: (open: boolean) => void } = $props()
</script>

<Combobox.Root bind:open={() => false, (next: boolean) => onOpenChange?.(next)}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list" />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
