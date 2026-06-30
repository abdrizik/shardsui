<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    errors = { autocomplete: 'test' }
  }: {
    errors?: Record<string, string | string[]>
  } = $props()
</script>

<Form {errors}>
  <Field.Root name="autocomplete">
    <Autocomplete.Root name="autocomplete">
      <Autocomplete.Input data-testid="input" />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.List>
              <Autocomplete.Item value="a">a</Autocomplete.Item>
              <Autocomplete.Item value="b">b</Autocomplete.Item>
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
