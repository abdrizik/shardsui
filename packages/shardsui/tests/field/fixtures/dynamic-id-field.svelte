<script lang="ts">
  import { Field } from '$lib/components/field'

  let { controlId = 'control-a' }: { controlId?: string } = $props()
</script>

<Field.Root>
  <Field.Label data-testid="label">Label</Field.Label>
  <Field.Control data-testid="control" id={controlId} />
</Field.Root>
