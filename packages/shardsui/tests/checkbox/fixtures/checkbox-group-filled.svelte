<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
</script>

<Field.Root>
  <CheckboxGroup value={['1', '2']}>
    <Checkbox.Root name="1" data-testid="checkbox-1" />
    <Checkbox.Root name="2" data-testid="checkbox-2" />
  </CheckboxGroup>
</Field.Root>
