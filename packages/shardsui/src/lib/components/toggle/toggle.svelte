<script lang="ts">
  import { untrack } from 'svelte'
  import { ToggleGroupContext } from '$lib/components/toggle-group/context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import { error } from '$lib/internal/log'
  import type { PartProps } from '$lib/internal/types'

  type Props = PartProps<[{ pressed: boolean; disabled: boolean }], 'button'> & {
    pressed?: boolean
    disabled?: boolean
    value?: string
    onPressedChange?: (pressed: boolean) => void
  }

  let {
    as = 'button',
    ref = $bindable(null),
    pressed: pressedProp = $bindable(false),
    disabled: disabledProp = false,
    tabindex: tabindexProp,
    type: _type,
    form: _form,
    value,
    onPressedChange,
    onclick,
    onkeydown,
    onkeyup,
    onpointerdown,
    onmousedown,
    onfocus,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()

  const group = ToggleGroupContext.getOr()

  const toggleValue = $derived(value || uid)
  const pressed = $derived(group ? group.value.includes(toggleValue) : pressedProp)
  const disabled = $derived(group?.disabled || disabledProp)
  const item = group
    ? new CompositeItem(() => ({ composite: group.composite, ref, disabled }))
    : undefined

  if (group?.isValueInitialized && untrack(() => value) === undefined) {
    error(
      'A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop.',
      'This will cause issues between the Toggle Group and Toggle values.',
      'Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.'
    )
  }

  function toggle() {
    const next = !pressed

    onPressedChange?.(next)

    if (group) {
      group.setValue(toggleValue, next)
    } else {
      pressedProp = next
    }
  }

  const btn = new Button(() => ({
    disabled,
    as,
    composite: !!group,
    tabindex: tabindexProp,
    onclick: chain(onclick, toggle),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(dataAttrs({ pressed, disabled }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  aria-pressed={pressed}
  {...item ? { tabindex: tabindexProp ?? item.tabindex } : {}}
  onfocus={chain(onfocus, item?.onfocus)}
  {...rest}
>
  {@render children?.({ pressed, disabled })}
</svelte:element>
