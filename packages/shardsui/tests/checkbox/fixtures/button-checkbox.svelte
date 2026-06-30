<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let {
    id = undefined
  }: {
    id?: string
  } = $props()
</script>

{#if id !== undefined}
  <label for={id} data-testid="label">Label</label>
{/if}
<Checkbox.Root {id} as="button">
  <Checkbox.Indicator />
</Checkbox.Root>
