<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Select } from '$lib/components/select'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
  let name = $state<string | undefined>('quantity')
</script>

<Form {onFormSubmit}>
  <Field.Root>
    <Select.Root {name} value="sans">
      <Select.Trigger>sans</Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item value="sans">sans</Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </Field.Root>
  <button type="button" onclick={() => (name = 'amount')}>Change name</button>
  <button type="button" onclick={() => (name = undefined)}>Clear name</button>
  <button type="submit">submit</button>
</Form>
