<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { validate }: { validate?: FieldValidator } = $props()
  let selected = $state<string[]>([])
</script>

<Field.Root validationMode="onChange" {validate} name="apple">
  <CheckboxGroup value={selected}>
    <Field.Item>
      <Checkbox.Root value="one" data-testid="checkbox" />
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="two" data-testid="checkbox" />
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
<button
  type="button"
  onclick={() => {
    selected = ['one']
  }}
>
  Select externally
</button>
