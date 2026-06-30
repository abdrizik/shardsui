<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = $bindable(undefined), onValueChange = undefined, showTab = true } = $props()
</script>

<Tabs.Root bind:value {onValueChange}>
  <Tabs.List>
    {#if showTab}
      <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    {/if}
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 0</Tabs.Panel>
</Tabs.Root>
