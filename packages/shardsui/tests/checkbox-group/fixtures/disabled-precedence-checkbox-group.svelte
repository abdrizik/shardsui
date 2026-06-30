<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
</script>

<CheckboxGroup disabled>
  <Checkbox.Root name="red" value="red" data-testid="red" disabled={false} />
  <Checkbox.Root name="green" value="green" data-testid="green" />
  <Checkbox.Root name="blue" value="blue" data-testid="blue" />
</CheckboxGroup>
