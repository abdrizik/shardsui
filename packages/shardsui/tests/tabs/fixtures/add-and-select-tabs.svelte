<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  import { untrack } from 'svelte'

  let { stringValues = false }: { stringValues?: boolean } = $props()

  const useStrings = untrack(() => stringValues)
  const initial = useStrings ? ['Overview', 'Projects'] : [0, 1]
  const added = useStrings ? 'Account' : 2

  let tabValues = $state<Array<string | number>>(initial)
  let value = $state<string | number>(initial[0])

  function addAndSelect() {
    tabValues = [...tabValues, added]
    value = added
  }
</script>

<button type="button" onclick={addAndSelect}>Add and Select</button>
<Tabs.Root {value} data-testid="root">
  <Tabs.List>
    {#each tabValues as tabValue (tabValue)}
      <Tabs.Tab value={tabValue}>{tabValue}</Tabs.Tab>
    {/each}
  </Tabs.List>
  {#each tabValues as tabValue (tabValue)}
    <Tabs.Panel value={tabValue} keepMounted data-testid="panel-{tabValue}" />
  {/each}
</Tabs.Root>
