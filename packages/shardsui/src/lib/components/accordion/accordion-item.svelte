<script lang="ts">
  import { CollapsibleContext } from '$lib/components/collapsible/context'
  import type { PartProps } from '$lib/internal/types'
  import { AccordionItem, type AccordionItemState } from './accordion.svelte'
  import { AccordionContext, AccordionItemContext } from './context'

  type Props = PartProps<[AccordionItemState]> & {
    value?: unknown
    disabled?: boolean
    onOpenChange?: (open: boolean) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value,
    disabled = false,
    onOpenChange,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()
  const accordion = AccordionContext.get()

  const item = new AccordionItem(() => ({
    uid,
    accordion,
    value,
    disabled,
    onOpenChange
  }))

  AccordionItemContext.set(item)
  CollapsibleContext.set(item.collapsible)
</script>

<svelte:element this={as} bind:this={ref} {...item.stateAttrs} {...rest}>
  {@render children?.(item.state)}
</svelte:element>
