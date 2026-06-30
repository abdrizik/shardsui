<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let { panelId = undefined, triggerId = undefined }: { panelId?: string; triggerId?: string } =
    $props()
</script>

<Collapsible.Root open>
  <Collapsible.Trigger id={triggerId}>Trigger</Collapsible.Trigger>
  <Collapsible.Panel id={panelId} data-testid="panel">This is panel content</Collapsible.Panel>
</Collapsible.Root>
