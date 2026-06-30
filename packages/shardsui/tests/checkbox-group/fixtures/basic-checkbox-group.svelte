<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let {
    value = $bindable<string[] | undefined>(undefined),
    disabled = false,
    onValueChange = undefined
  }: {
    value?: string[]
    disabled?: boolean
    onValueChange?: (value: string[]) => void
  } = $props()
</script>

<CheckboxGroup {value} {disabled} {onValueChange}>
  <Checkbox.Root name="red" value="red" data-testid="red" />
  <Checkbox.Root name="green" value="green" data-testid="green" />
  <Checkbox.Root name="blue" value="blue" data-testid="blue" />
</CheckboxGroup>
