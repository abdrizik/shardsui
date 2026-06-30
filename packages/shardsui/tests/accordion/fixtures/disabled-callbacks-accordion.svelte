<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    disabledPart,
    onValueChange = undefined,
    onOpenChange = undefined,
    onclick = undefined
  }: {
    disabledPart: 'root' | 'item'
    onValueChange?: (value: unknown[]) => void
    onOpenChange?: (open: boolean) => void
    onclick?: (event: MouseEvent) => void
  } = $props()
</script>

<Accordion.Root disabled={disabledPart === 'root'} {onValueChange}>
  <Accordion.Item value={0} disabled={disabledPart === 'item'} {onOpenChange}>
    <Accordion.Header>
      <Accordion.Trigger disabled={false} {onclick}>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value={1} {onOpenChange}>
    <Accordion.Header>
      <Accordion.Trigger disabled={false} {onclick}>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 2</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
