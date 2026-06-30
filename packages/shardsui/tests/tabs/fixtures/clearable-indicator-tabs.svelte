<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { value = 0 }: { value?: number | null } = $props()
</script>

<Tabs.Root {value} data-testid="root">
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 2</Tabs.Tab>
    <Tabs.Indicator data-testid="indicator" />
  </Tabs.List>
</Tabs.Root>
