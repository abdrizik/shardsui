<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { ScrollAreaContext } from './context'
  import type { ScrollAreaRootState } from './scroll-area.svelte'

  type Props = PartProps<[ScrollAreaRootState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const scrollArea = ScrollAreaContext.get()

  const mergedStyle = $derived(mergeStyle('min-width: fit-content', style))

  const hadMeasuredAtMount = scrollArea.hasMeasured

  const observeResize: Attachment<HTMLElement> = (node) => {
    let hasInitialized = false
    const observer = new ResizeObserver(() => {
      if (!hasInitialized) {
        hasInitialized = true

        // ResizeObserver always fires once upon observing.
        if (!hadMeasuredAtMount) {
          return
        }
      }

      scrollArea.measure()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...scrollArea.stateAttrs}
  {@attach observeResize}
  role="presentation"
  style={mergedStyle}
  {...rest}
>
  {@render children?.(scrollArea.state)}
</svelte:element>
