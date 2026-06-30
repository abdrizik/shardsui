<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  import type { TabsValue } from '$lib/components/tabs'

  const tabValues: TabsValue[] = [0, '0', 1, '1']
</script>

<Tabs.Root>
  <Tabs.List>
    {#each tabValues as value (String(typeof value) + String(value))}
      <Tabs.Tab {value}>Tab {typeof value} {value}</Tabs.Tab>
    {/each}
  </Tabs.List>
  {#each tabValues as value (String(typeof value) + String(value))}
    <Tabs.Panel {value} keepMounted>Panel {typeof value} {value}</Tabs.Panel>
  {/each}
</Tabs.Root>
