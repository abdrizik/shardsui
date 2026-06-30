<script lang="ts">
  import { Field } from '$lib/components/field'

  let { which = 'a' }: { which?: 'a' | 'b' } = $props()
</script>

<Field.Root>
  <Field.Label data-testid="label">Label</Field.Label>
  {#if which === 'a'}
    <Field.Control id="control-a" data-testid="control-a" />
  {:else}
    <Field.Control id="control-b" data-testid="control-b" />
  {/if}
</Field.Root>
