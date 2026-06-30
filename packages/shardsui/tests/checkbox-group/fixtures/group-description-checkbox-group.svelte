<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
</script>

<Field.Root name="apple">
  <CheckboxGroup value={[]} aria-describedby="external-description">
    <Field.Description data-testid="group-description">Group description</Field.Description>
    <Field.Item>
      <Field.Label>
        <Checkbox.Root value="fuji-apple" aria-describedby="checkbox-description" />
        Fuji
      </Field.Label>
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
