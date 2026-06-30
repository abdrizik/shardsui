<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = 0, onValueChange = undefined, onpointerdown = undefined } = $props()
</script>

<Tabs.Root {value} {onValueChange}>
  <Tabs.List activateOnFocus>
    <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1} {onpointerdown}>Tab 1</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
