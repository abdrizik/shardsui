<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  let { onCheckedChange = undefined } = $props()
  let checked = $state(false)
</script>

<Checkbox.Root bind:checked={() => checked, () => {}} {onCheckedChange}>
  <Checkbox.Indicator />
</Checkbox.Root>
