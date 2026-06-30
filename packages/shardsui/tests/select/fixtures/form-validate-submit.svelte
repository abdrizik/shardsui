<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    validate = (val: unknown) => (val === '2' ? 'error' : null)
  }: {
    validate?: (value: unknown) => string | null
  } = $props()
</script>

<Form>
  <Field.Root {validate}>
    <Select.Root required>
      <Select.Trigger data-testid="trigger">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item value="1">Option 1</Select.Item>
            <Select.Item value="2">Option 2</Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </Field.Root>
  <button type="submit" data-testid="submit">submit</button>
</Form>
