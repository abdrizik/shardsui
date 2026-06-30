<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let value = $state('overview')
</script>

<Tabs.Root bind:value>
  <Tabs.List>
    <Tabs.Tab as="a" value="overview" {...{ href: '#overview' }}>Overview</Tabs.Tab>
    <Tabs.Tab as="a" value="details" {...{ href: '#details' }}>Details</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
