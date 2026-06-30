<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let names = $state(['a', 'b'])
</script>

<button type="button" onclick={() => (names = ['b', 'a'])}>Reorder</button>
<Form>
  {#each names as name (name)}
    <Field.Root {name}>
      <Checkbox.Root required data-testid={name} />
    </Field.Root>
  {/each}
  <button type="submit">Submit</button>
</Form>
