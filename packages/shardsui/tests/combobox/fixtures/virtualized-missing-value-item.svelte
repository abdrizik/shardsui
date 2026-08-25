<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable(true) } = $props()
</script>

<Combobox.Root virtualized items={['one']} bind:open>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item>missing value</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
