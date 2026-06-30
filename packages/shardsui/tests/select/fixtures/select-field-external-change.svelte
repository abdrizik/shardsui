<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'

  let { validate = undefined }: { validate?: (val: unknown) => string | null } = $props()

  let value = $state('a')

  const validateFn = $derived(validate ?? ((val: unknown) => (val === 'b' ? 'error' : null)))
</script>

<div>
  <Field.Root validationMode="onChange" validate={validateFn} name="flavor">
    <Select.Root {value} onValueChange={(next) => (value = next as string)}>
      <Select.Trigger data-testid="trigger">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item value="a">Option A</Select.Item>
            <Select.Item value="b">Option B</Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </Field.Root>
  <button type="button" data-testid="set-external" onclick={() => (value = 'b')}>
    Select externally
  </button>
</div>
