<script lang="ts">
  import { createTypeahead } from '$lib/internal/floating/typeahead.svelte'

  type Props = {
    items?: string[]
    onMatch?: (index: number) => void
    onTyping?: (isTyping: boolean) => void
    enabled?: () => boolean
    resetMs?: number
    hiddenIndices?: number[]
    nestedInput?: boolean
  }

  let {
    items = ['one', 'two', 'three'],
    onMatch = undefined,
    onTyping = undefined,
    enabled = undefined,
    resetMs = undefined,
    hiddenIndices = [],
    nestedInput = false
  }: Props = $props()

  let activeIndex = $state(-1)
  let itemEls = $state<(HTMLElement | null)[]>([])

  const typeahead = createTypeahead(() => ({
    items,
    activeIndex,
    onMatch: (i) => {
      activeIndex = i
      onMatch?.(i)
    },
    onTyping,
    enabled: enabled?.(),
    resetMs,
    elements: itemEls
  }))
</script>

<div
  role="listbox"
  data-testid="container"
  tabindex="0"
  onkeydown={typeahead.matchKey}
  onblur={typeahead.resetOnFocusLeave}
>
  {#if nestedInput}
    <input data-testid="nested-input" readonly />
  {/if}
  {#each items as item, i (i)}
    <div
      role="option"
      data-testid="item-{i}"
      aria-selected={activeIndex === i}
      style={hiddenIndices.includes(i) ? 'display:none' : undefined}
      bind:this={itemEls[i]}
    >
      {item}
    </div>
  {/each}
</div>
