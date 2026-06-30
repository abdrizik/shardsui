<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let { panelMounted = true }: { panelMounted?: boolean } = $props()
</script>

<Collapsible.Root open>
  <Collapsible.Trigger />
  {#if panelMounted}
    <Collapsible.Panel data-testid="panel" />
  {/if}
</Collapsible.Root>
