<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { initialFocus }: { initialFocus?: boolean } = $props()
</script>

<Combobox.Root>
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup" {initialFocus}>
        <Combobox.Input data-testid="input" />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
