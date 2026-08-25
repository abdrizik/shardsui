<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field, type FieldValidator } from '$lib/components/field'

  let { validate }: { validate?: FieldValidator } = $props()
</script>

<Field.Root validationMode="onBlur" {validate}>
  <Autocomplete.Root open value="query">
    <Autocomplete.Trigger data-testid="trigger">Open</Autocomplete.Trigger>
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.Input data-testid="input" />
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
</Field.Root>
