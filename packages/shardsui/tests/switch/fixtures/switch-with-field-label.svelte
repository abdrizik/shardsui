<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import { Field } from '$lib/components/field'
  let { labelPosition = 'sibling' as 'implicit' | 'sibling' | 'nonNativeLabel' } = $props()
</script>

<Field.Root>
  {#if labelPosition === 'implicit'}
    <Field.Label data-testid="label">
      <Switch.Root>
        <Switch.Thumb />
      </Switch.Root>
      OK
    </Field.Label>
  {:else if labelPosition === 'sibling'}
    <Field.Label data-testid="label">Label</Field.Label>
    <Switch.Root>
      <Switch.Thumb />
    </Switch.Root>
  {:else if labelPosition === 'nonNativeLabel'}
    <Field.Label data-testid="label" as="span">
      <Switch.Root>
        <Switch.Thumb />
      </Switch.Root>
    </Field.Label>
  {/if}
</Field.Root>
