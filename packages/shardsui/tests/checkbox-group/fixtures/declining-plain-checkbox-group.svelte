<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { onValueChange = undefined }: { onValueChange?: (value: string[]) => void } = $props()

  const value = $state<string[]>([])
</script>

<CheckboxGroup bind:value={() => value, () => {}} {onValueChange}>
  <Checkbox.Root value="red" data-testid="red" />
  <Checkbox.Root value="green" data-testid="green" />
</CheckboxGroup>
