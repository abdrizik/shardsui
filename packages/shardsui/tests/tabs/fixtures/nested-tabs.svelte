<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let outer = $state('outer-1')
  let inner = $state('inner-1')
</script>

<Tabs.Root bind:value={outer}>
  <Tabs.List data-testid="outer-list">
    <Tabs.Tab value="outer-1">Outer 1</Tabs.Tab>
    <Tabs.Tab value="outer-2">Outer 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="outer-1" data-testid="outer-panel-1">
    <Tabs.Root bind:value={inner}>
      <Tabs.List data-testid="inner-list">
        <Tabs.Tab value="inner-1">Inner 1</Tabs.Tab>
        <Tabs.Tab value="inner-2">Inner 2</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="inner-1">Inner panel 1</Tabs.Panel>
      <Tabs.Panel value="inner-2">Inner panel 2</Tabs.Panel>
    </Tabs.Root>
  </Tabs.Panel>
  <Tabs.Panel value="outer-2">Outer panel 2</Tabs.Panel>
</Tabs.Root>
