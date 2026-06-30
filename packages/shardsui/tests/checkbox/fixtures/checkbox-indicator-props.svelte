<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  let { checked = $bindable(false), indeterminate = false, keepMounted = false, ...rest } = $props()
</script>

<Checkbox.Root bind:checked {indeterminate}>
  <Checkbox.Indicator data-testid="indicator" {keepMounted} {...rest} />
</Checkbox.Root>
