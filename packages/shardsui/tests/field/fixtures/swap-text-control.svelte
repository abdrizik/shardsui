<script lang="ts">
  import { Field } from '$lib/components/field'

  let swapped = $state(false)
</script>

<Field.Root data-testid="root">
  {#if swapped}
    <Field.Control data-testid="control" value="x" />
  {:else}
    <Field.Control value="a" />
  {/if}
</Field.Root>
<button type="button" onclick={() => (swapped = true)}>swap</button>
