<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  let {
    checked = $bindable(false),
    required = false,
    disabled = false,
    indeterminate = false,
    readOnly = false,
    name = undefined,
    onCheckedChange = undefined
  } = $props()
</script>

<Checkbox.Root
  bind:checked
  {required}
  {disabled}
  {indeterminate}
  {readOnly}
  {name}
  {onCheckedChange}
>
  <Checkbox.Indicator />
</Checkbox.Root>
