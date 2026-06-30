<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let {
    initialValidate,
    renamedValidate,
    replacementValidate
  }: {
    initialValidate: () => string | null
    renamedValidate: () => string | null
    replacementValidate: () => string | null
  } = $props()

  let form = $state<ReturnType<typeof Form>>()
  let step = $state(0)

  const visible = $derived(step !== 2)
  const name = $derived(step === 0 ? 'initial' : 'current')
  const validate = $derived.by(() => {
    if (step === 1) return renamedValidate
    if (step > 1) return replacementValidate
    return initialValidate
  })
</script>

<Form bind:this={form}>
  {#if visible}
    {#key step}
      <Field.Root {name} {validate}>
        <Field.Control id="control-{step}" />
      </Field.Root>
    {/key}
  {/if}
</Form>
<button type="button" onclick={() => (step = 1)}>Rename</button>
<button type="button" onclick={() => (step = 2)}>Unmount</button>
<button type="button" onclick={() => (step = 3)}>Replace</button>
<button type="button" onclick={() => form?.validate('initial')}>Validate initial</button>
<button type="button" onclick={() => form?.validate('current')}>Validate current</button>
