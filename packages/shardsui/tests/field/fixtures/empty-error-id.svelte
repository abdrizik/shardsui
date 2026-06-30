<script lang="ts">
  import { Field } from '$lib/components/field'
</script>

<Field.Root invalid>
  <Field.Control aria-describedby="external-description" />
  <Field.Error id="" match={true}>Message</Field.Error>
</Field.Root>
