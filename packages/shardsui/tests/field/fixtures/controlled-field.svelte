<script lang="ts">
  import { Field } from '$lib/components/field'

  let value = $state('')
</script>

<Field.Root>
  <Field.Label data-testid="label">Label</Field.Label>
  <Field.Control data-testid="control" {value} />
</Field.Root>
<button
  type="button"
  data-testid="change-btn"
  onclick={() => {
    value = 'test'
  }}>change</button
>
<button
  type="button"
  data-testid="reset-btn"
  onclick={() => {
    value = ''
  }}>reset</button
>
