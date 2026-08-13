<script lang="ts">
  import { Fieldset } from '@shardsui/svelte/fieldset'
  import { Field } from '@shardsui/svelte/field'
</script>

<Fieldset.Root class="flex w-full max-w-64 flex-col gap-4">
  <Fieldset.Legend class="text-base font-semibold text-gray-900">Profile</Fieldset.Legend>

  {@render field('Full name', 'Otl Aicher')}
  {@render field('Expertise', 'Design systems')}
</Fieldset.Root>

{#snippet field(label: string, placeholder: string)}
  <Field.Root class="flex flex-col items-start gap-1">
    <Field.Label class="text-sm font-semibold text-gray-900">{label}</Field.Label>
    <Field.Control
      {placeholder}
      class="h-8 w-full rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </Field.Root>
{/snippet}
