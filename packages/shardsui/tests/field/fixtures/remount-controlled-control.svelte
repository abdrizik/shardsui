<script lang="ts">
  import { Field } from '$lib/components/field'

  let value = $state('a')
  let mounted = $state(true)
</script>

<Field.Root data-testid="root">
  {#if mounted}
    <Field.Control data-testid="control" {value} onValueChange={(next) => (value = next)} />
  {/if}
</Field.Root>
<button type="button" onclick={() => (mounted = !mounted)}>toggle</button>
