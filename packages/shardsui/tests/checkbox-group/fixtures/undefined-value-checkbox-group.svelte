<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let value = $state<string[] | undefined>(['red'])
</script>

<CheckboxGroup {value}>
  <Checkbox.Root value="red" data-testid="red" />
</CheckboxGroup>
<button type="button" onclick={() => (value = undefined)}>Clear</button>
