<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { MenuGroupContext, MenuRadioGroupContext, type MenuRadioGroupState } from './context'

  type Props = PartProps<[MenuRadioGroupState]> & {
    value?: unknown
    disabled?: boolean
    onValueChange?: (value: unknown) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable(),
    disabled = false,
    onValueChange,
    children,
    ...rest
  }: Props = $props()

  const group = $state({ labelId: undefined as string | undefined })

  MenuRadioGroupContext.set({
    get value() {
      return value
    },
    setValue(v: unknown) {
      onValueChange?.(v)
      value = v
    },
    get disabled() {
      return disabled
    }
  })
  MenuGroupContext.set(group)

  const stateAttrs = $derived(dataAttrs({ disabled }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="group"
  aria-disabled={disabled || undefined}
  aria-labelledby={group.labelId}
  {...rest}
>
  {@render children?.({ disabled })}
</svelte:element>
