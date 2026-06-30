<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { shadowedMounted = true }: { shadowedMounted?: boolean } = $props()
</script>

<Tabs.Root value="a">
  <Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab>
    <Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List>
  {#if shadowedMounted}
    <Tabs.Panel value="b" keepMounted data-testid="shadowed">Shadowed</Tabs.Panel>
  {/if}
  <Tabs.Panel value="b" keepMounted data-testid="owner">Owner</Tabs.Panel>
</Tabs.Root>
