<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
</script>

<Field.Root>
  <Checkbox.Root aria-describedby="external-description" />
  <Field.Description data-testid="description">Description</Field.Description>
</Field.Root>
