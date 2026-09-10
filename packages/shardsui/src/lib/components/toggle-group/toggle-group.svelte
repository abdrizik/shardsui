<script lang="ts" generics="Value extends string = string">
  import { ToolbarGroupContext, ToolbarContext } from '$lib/components/toolbar/context'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { Composite } from '$lib/internal/floating/composite.svelte'
  import type { Orientation, PartProps } from '$lib/internal/types'
  import { ToggleGroupContext, type ToggleGroupState } from './context'

  type Props = PartProps<[ToggleGroupState]> & {
    value?: readonly Value[]
    disabled?: boolean
    multiple?: boolean
    orientation?: Orientation
    loopFocus?: boolean
    onValueChange?: (value: Value[]) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable(),
    disabled: disabledProp = false,
    multiple = false,
    orientation = 'horizontal',
    loopFocus = true,
    onValueChange,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const toolbar = ToolbarContext.getOr()
  const toolbarGroup = ToolbarGroupContext.getOr()

  const composite =
    toolbar?.composite ??
    new Composite(() => ({ orientation, loopFocus, enableHomeAndEnd: true, ref }))

  const isValueInitialized = value !== undefined

  const groupValue = $derived(value ?? [])
  const disabled = $derived(toolbar?.disabled || toolbarGroup?.disabled || disabledProp)

  function setValue(toggleValue: string, nextPressed: boolean) {
    const item = toggleValue as Value
    let next: Value[]

    if (!multiple) {
      next = nextPressed ? [item] : []
    } else if (nextPressed) {
      next = [...groupValue, item]
    } else {
      next = groupValue.filter((entry) => entry !== item)
    }

    onValueChange?.(next)
    value = next
  }

  const toggleGroup = {
    composite,
    isValueInitialized,
    setValue,
    get value() {
      return groupValue
    },
    get disabled() {
      return disabled
    }
  }

  ToggleGroupContext.set(toggleGroup)

  const toggleGroupState = $derived<ToggleGroupState>({ disabled, multiple, orientation })

  const stateAttrs = $derived(dataAttrs(toggleGroupState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="group"
  onkeydown={chain(onkeydown, toolbar ? undefined : composite.onkeydown)}
  {...rest}
>
  {@render children?.(toggleGroupState)}
</svelte:element>
