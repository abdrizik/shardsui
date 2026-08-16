<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { contains } from '$lib/internal/dom'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import { on } from 'svelte/events'
  import { TabsListContext, TabsContext, type TabsTabState } from './context'
  import type { TabsValue } from './tabs.svelte'

  type Props = PartProps<
    [TabsTabState],
    'button',
    'onclick' | 'onfocus' | 'onkeydown' | 'onkeyup' | 'onpointerdown'
  > & {
    value: TabsValue
    disabled?: boolean
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    value,
    disabled = false,
    onfocus,
    onpointerdown,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    children,
    ...rest
  }: Props = $props()

  const tabs = TabsContext.get()
  const list = TabsListContext.get()
  let isPressing = false
  let isMainButton = false

  const active = $derived(value === tabs.value)
  const item = new CompositeItem(() => ({
    composite: list.composite,
    ref,
    disabled: false,
    active
  }))
  const tabindex = $derived(active && item.index === -1 ? 0 : item.tabindex)
  const tabPanelId = $derived(tabs.getPanelIdByValue(value))

  $effect(() =>
    tabs.registerTab({
      get id() {
        return id
      },
      get element() {
        return ref
      },
      get value() {
        return value
      },
      get disabled() {
        return disabled
      }
    })
  )

  $effect.pre(() => {
    if (!active || disabled) return
    if (item.index === -1 || list.composite.highlightedIndex === item.index) return
    if (contains(list.element, (list.element?.ownerDocument ?? document).activeElement)) return

    list.composite.setHighlightedIndex(item.index)
  })

  function trackPress(event: PointerEvent) {
    if (active || disabled || !ref) return
    isPressing = true
    isMainButton = event.button === 0

    const doc = ref.ownerDocument
    const controller = new AbortController()
    const end = () => {
      isPressing = false
      isMainButton = false
      controller.abort()
    }
    on(doc, 'pointerup', end, { signal: controller.signal })
    on(doc, 'pointercancel', end, { signal: controller.signal })
  }

  function focusTab() {
    item.onfocus()

    if (active || disabled) return

    if (list.activateOnFocus && (!isPressing || isMainButton)) {
      tabs.setValue(value)
    }
  }

  const btn = new Button(() => ({
    disabled,
    focusableWhenDisabled: true,
    composite: true,
    as,
    onclick: chain(onclick, (event) => {
      if (active || disabled || event.button !== 0) return
      tabs.setValue(value)
    }),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown: chain(onpointerdown, trackPress)
  }))

  const tabsState: TabsTabState = $derived({ ...tabs.state, active, disabled })

  const stateAttrs = $derived(dataAttrs({ active, disabled }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...tabs.stateAttrs}
  {...stateAttrs}
  {@attach list.observeTab}
  {@attach btn.attach}
  {id}
  role="tab"
  aria-controls={tabPanelId}
  aria-selected={active}
  {tabindex}
  onfocus={chain(onfocus, focusTab)}
  {...rest}
>
  {@render children?.(tabsState)}
</svelte:element>
