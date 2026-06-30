<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let { parts = 'both' }: { parts?: 'both' | 'trigger' | 'panel' } = $props()
</script>

<Accordion.Root value={[0]}>
  <Accordion.Item value={0}>
    <Accordion.Header>
      {#if parts !== 'panel'}
        <Accordion.Trigger>Trigger 1</Accordion.Trigger>
      {/if}
    </Accordion.Header>
    {#if parts !== 'trigger'}
      <Accordion.Panel>Panel contents 1</Accordion.Panel>
    {/if}
  </Accordion.Item>
</Accordion.Root>
