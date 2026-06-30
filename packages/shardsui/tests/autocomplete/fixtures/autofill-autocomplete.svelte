<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'

  let {
    readOnly = false,
    disabled = false,
    onValueChange
  }: {
    readOnly?: boolean
    disabled?: boolean
    onValueChange?: (value: string) => void
  } = $props()
</script>

<Field.Root name="auto">
  <Autocomplete.Root {readOnly} {disabled} {onValueChange}>
    <Autocomplete.Input data-testid="input" />
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.List>
            <Autocomplete.Item value="alpha">alpha</Autocomplete.Item>
            <Autocomplete.Item value="beta">beta</Autocomplete.Item>
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
</Field.Root>
