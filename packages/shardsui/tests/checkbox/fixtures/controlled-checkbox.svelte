<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let checked = $state(false)
</script>

<button onclick={() => (checked = !checked)} data-testid="toggle">Toggle</button>
<Checkbox.Root {checked}>
  <Checkbox.Indicator />
</Checkbox.Root>
