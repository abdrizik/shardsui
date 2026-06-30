<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onsubmit = undefined as ((event: SubmitEvent) => void) | undefined } = $props()
</script>

<Form {onsubmit}>
  <Field.Root name="combobox">
    <Combobox.Root required>
      <Combobox.Trigger data-testid="trigger">
        <Combobox.Value />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup data-testid="popup">
            <Combobox.Input data-testid="input" />
            <Combobox.List data-testid="list">
              <Combobox.Item value="a">a</Combobox.Item>
              <Combobox.Item value="b">b</Combobox.Item>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
