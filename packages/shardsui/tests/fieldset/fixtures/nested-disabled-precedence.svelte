<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'

  let outerDisabled = $state(false)
  let innerDisabled = $state(true)
</script>

<Fieldset.Root disabled={outerDisabled}>
  <Fieldset.Root disabled={innerDisabled}>
    <Field.Root data-testid="root">
      <Field.Control data-testid="control" />
    </Field.Root>
  </Fieldset.Root>
</Fieldset.Root>
<button type="button" onclick={() => (outerDisabled = true)}>Disable outer</button>
<button type="button" onclick={() => (innerDisabled = false)}>Enable inner</button>
<button type="button" onclick={() => (outerDisabled = false)}>Enable outer</button>
