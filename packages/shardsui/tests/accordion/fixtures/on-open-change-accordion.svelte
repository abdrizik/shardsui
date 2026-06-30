<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = [],
    onOpenChange = undefined,
    onValueChange = undefined,
    as = 'button'
  }: {
    value?: unknown[]
    onOpenChange?: (open: boolean) => void
    onValueChange?: (value: unknown[]) => void
    as?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<Accordion.Root {value} {onValueChange}>
  <Accordion.Item {onOpenChange}>
    <Accordion.Header>
      <Accordion.Trigger {as}>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel contents 1</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
