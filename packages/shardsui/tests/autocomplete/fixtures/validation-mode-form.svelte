<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    validate = undefined
  }: {
    validate?: (value: unknown) => string | null
  } = $props()
</script>

<Form>
  <Field.Root {validate}>
    <Autocomplete.Root required>
      <Autocomplete.Input data-testid="input" />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.List>
              <Autocomplete.Item value="one">Option 1</Autocomplete.Item>
              <Autocomplete.Item value="two">Option 2</Autocomplete.Item>
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  </Field.Root>
  <button type="submit" data-testid="submit">submit</button>
</Form>
