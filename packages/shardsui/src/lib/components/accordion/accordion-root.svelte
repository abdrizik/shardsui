<script lang="ts" generics="Value = unknown">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { AccordionRoot, type AccordionRootState } from './accordion.svelte'
  import { AccordionContext } from './context'

  type Props = PartProps<[AccordionRootState<Value>]> & {
    value?: Value[]
    disabled?: boolean
    hiddenUntilFound?: boolean
    keepMounted?: boolean
    multiple?: boolean
    onValueChange?: (value: Value[]) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable([]),
    disabled = false,
    hiddenUntilFound = false,
    keepMounted = false,
    multiple = false,
    onValueChange,
    children,
    ...rest
  }: Props = $props()

  const accordion = new AccordionRoot<Value>(() => ({
    value,
    setValue: (next) => {
      onValueChange?.(next)
      value = next
    },
    disabled,
    hiddenUntilFound,
    keepMounted,
    multiple
  }))

  AccordionContext.set(accordion)

  const stateAttrs = $derived(dataAttrs({ disabled }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest}>
  {@render children?.(accordion.state)}
</svelte:element>
