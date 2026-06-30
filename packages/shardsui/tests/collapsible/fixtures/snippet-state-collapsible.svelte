<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'
</script>

<Collapsible.Root data-testid="root">
  {#snippet children({ open })}
    <Collapsible.Trigger>
      {#snippet children({ open: triggerOpen })}
        <span data-testid="trigger-state">{triggerOpen ? 'open' : 'closed'}</span>
      {/snippet}
    </Collapsible.Trigger>
    <Collapsible.Panel keepMounted data-testid="panel">
      {#snippet children({ open: panelOpen })}
        <span data-testid="panel-state">{panelOpen ? 'open' : 'closed'}</span>
      {/snippet}
    </Collapsible.Panel>
    <span data-testid="root-state">{open ? 'open' : 'closed'}</span>
  {/snippet}
</Collapsible.Root>
