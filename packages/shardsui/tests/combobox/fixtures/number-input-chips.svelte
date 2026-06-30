<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<Combobox.Root multiple items={['apple']} value={['apple']}>
  <Combobox.Chips>
    <Combobox.Chip data-testid="chip">apple</Combobox.Chip>
    <Combobox.Input type="number" data-testid="input" />
  </Combobox.Chips>
</Combobox.Root>
