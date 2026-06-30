<script lang="ts">
  import type { Composite } from '$lib/internal/floating/composite.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'

  type Props = {
    composite: Composite
    label: string
    disabled?: boolean
  }

  let { composite, label, disabled = false }: Props = $props()

  let el = $state<HTMLElement | null>(null)

  $effect(() => {
    if (!el) return
    return composite.register(el, { disabled })
  })

  const ownIndex = $derived(composite.indexOfElement(el!))
  const tabindex = $derived(ownIndex === composite.highlightedIndex ? 0 : -1)
  const isActive = $derived(ownIndex === composite.highlightedIndex)
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  data-testid={label}
  bind:this={el}
  {tabindex}
  aria-disabled={disabled || undefined}
  data-disabled={disabled ? '' : undefined}
  {...dataAttrs({ active: isActive })}
  onfocus={() => composite.setHighlightedIndex(ownIndex)}
>
  {label}
</span>
