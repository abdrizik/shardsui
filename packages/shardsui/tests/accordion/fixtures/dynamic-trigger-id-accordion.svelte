<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let { initialTriggerId = undefined }: { initialTriggerId?: string } = $props()

  // svelte-ignore state_referenced_locally
  let triggerId = $state<string | undefined>(initialTriggerId)
</script>

<button type="button" onclick={() => (triggerId = 'custom-trigger-id-1')}>Set id 1</button>
<button type="button" onclick={() => (triggerId = 'custom-trigger-id-2')}>Set id 2</button>
<button type="button" onclick={() => (triggerId = undefined)}>Remove id</button>

<Accordion.Root value={[0]}>
  <Accordion.Item value={0}>
    <Accordion.Header>
      <Accordion.Trigger id={triggerId}>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel contents 1</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
