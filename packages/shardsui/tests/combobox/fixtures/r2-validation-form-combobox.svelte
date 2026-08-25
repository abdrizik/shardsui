<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  type FieldProps = ComponentProps<typeof Field.Root>

  let {
    validate = (value: unknown) => (value === 'a' ? 'error' : null)
  }: { validate?: FieldProps['validate'] } = $props()
</script>

<Form>
  <Field.Root {validate}>
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
