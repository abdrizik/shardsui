<script lang="ts">
  import { Field } from '$lib/components/field'

  let controlId = $state<string | undefined>('control-a')
</script>

<Field.Root>
  <Field.Label data-testid="label">Label</Field.Label>
  <Field.Control data-testid="control" id={controlId} />
</Field.Root>
<button type="button" onclick={() => (controlId = undefined)}>Clear</button>
