<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    errors = { country: 'server error' }
  }: {
    errors?: Record<string, string | string[]>
  } = $props()

  let value = $state<unknown>()
  const allow = false
</script>

<Form {errors}>
  <Field.Root name="country">
    <Select.Root bind:value={() => value, (next) => (allow ? (value = next) : undefined)}>
      <Select.Trigger data-testid="trigger">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item value="US">United States</Select.Item>
            <Select.Item value="CA">Canada</Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
