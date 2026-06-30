<script lang="ts">
  import { Switch } from '$lib/components/switch'

  let {
    id = undefined
  }: {
    id?: string
  } = $props()
</script>

{#if id !== undefined}
  <label for={id} data-testid="label">Toggle</label>
{/if}
<Switch.Root {id} as="button">
  <Switch.Thumb />
</Switch.Root>
