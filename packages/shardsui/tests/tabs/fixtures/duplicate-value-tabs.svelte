<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { onValueChange = undefined }: { onValueChange?: (value: unknown) => void } = $props()
</script>

<Tabs.Root {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value="a" disabled>Stale duplicate</Tabs.Tab>
    <Tabs.Tab value="a">A</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
