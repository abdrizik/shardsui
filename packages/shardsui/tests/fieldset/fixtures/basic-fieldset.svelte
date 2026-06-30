<script lang="ts">
  import { Fieldset } from '$lib/components/fieldset'

  let {
    disabled = false,
    ...legend
  }: {
    disabled?: boolean
    as?: keyof HTMLElementTagNameMap
    id?: string
    'data-testid'?: string
  } = $props()
</script>

<Fieldset.Root {disabled}>
  <Fieldset.Legend {...legend}>My Legend</Fieldset.Legend>
  <input type="text" name="field" />
</Fieldset.Root>
