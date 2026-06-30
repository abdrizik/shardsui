<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { validate = (value: unknown) => (value === 'a' ? 'error' : null) } = $props()
</script>

<Form>
  <Field.Root validate={validate as never}>
    <Combobox.Root required>
      <Combobox.Input data-testid="input" />
      <Combobox.Clear data-testid="clear" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup data-testid="popup">
            <Combobox.List data-testid="list">
              <Combobox.Item value="a">a</Combobox.Item>
              <Combobox.Item value="b">b</Combobox.Item>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  </Field.Root>
  <button type="submit">submit</button>
</Form>
