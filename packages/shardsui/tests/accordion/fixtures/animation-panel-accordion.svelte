<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = ['one']
  }: {
    value?: unknown[]
  } = $props()
</script>

<Accordion.Root {value}>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Accordion.Trigger>Trigger</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel
      data-testid="panel"
      style="animation-duration: 100ms; animation-name: panel-slide-down; animation-timing-function: linear;"
    >
      Panel content
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
