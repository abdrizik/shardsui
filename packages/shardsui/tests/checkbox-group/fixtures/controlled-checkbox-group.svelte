<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let value = $state<string[]>([])
</script>

<CheckboxGroup bind:value>
  <Checkbox.Root value="red" data-testid="red" />
  <Checkbox.Root value="green" data-testid="green" />
  <Checkbox.Root value="blue" data-testid="blue" />
</CheckboxGroup>
