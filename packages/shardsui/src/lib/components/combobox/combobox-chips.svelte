<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { observeDocumentOrder } from '$lib/internal/document-order.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { ComboboxContext, ComboboxChipsContext } from './context'
  import { focusInputOnPress } from './focus-input-on-press'

  type Props = PartProps<[], 'div', 'onmousedown'>

  let { as = 'div', ref = $bindable(null), onmousedown, children, ...rest }: Props = $props()

  const combobox = ComboboxContext.get()

  let highlightedIndex = $state<number | undefined>(undefined)
  const elements = $state<HTMLElement[]>([])

  $effect.pre(() => {
    if (combobox.open && highlightedIndex !== undefined) {
      highlightedIndex = undefined
    }
  })

  observeDocumentOrder(() => ({
    container: ref,
    items: elements,
    elementOf: (chip: HTMLElement) => chip,
    reorder: (sorted: HTMLElement[]) => {
      elements.splice(0, elements.length, ...sorted)
    }
  }))

  const hasChips = $derived(combobox.multiple && combobox.hasSelectedValue)

  function onPress(event: MouseEvent) {
    focusInputOnPress(event, combobox, ref)
  }

  ComboboxChipsContext.set({
    get highlightedIndex() {
      return highlightedIndex
    },
    set highlightedIndex(index) {
      highlightedIndex = index
    },
    get elements() {
      return elements
    }
  })
</script>

<!-- NVDA enters browse mode instead of staying in focus mode when navigating with
arrow keys inside a container unless it has a toolbar role. -->
<svelte:element
  this={as}
  bind:this={ref}
  {@attach attachElement((el) => (combobox.chipsContainerElement = el))}
  role={hasChips ? 'toolbar' : undefined}
  onmousedown={chain(onmousedown, onPress)}
  {...rest}
>
  {@render children?.()}
</svelte:element>
