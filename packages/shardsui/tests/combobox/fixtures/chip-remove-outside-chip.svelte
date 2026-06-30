<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<Combobox.Root multiple>
  <Combobox.Chips data-testid="chips">
    <Combobox.ChipRemove data-testid="remove" />
  </Combobox.Chips>
</Combobox.Root>
