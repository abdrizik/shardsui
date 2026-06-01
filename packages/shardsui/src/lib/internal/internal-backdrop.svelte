<script lang="ts">
  import { autoUpdate } from '@floating-ui/dom'
  import type { Attachment } from 'svelte/attachments'
  import type { HTMLAttributes } from 'svelte/elements'

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    ref?: HTMLElement | null
    cutout?: Element | null
  }

  let { ref = $bindable(null), cutout, ...rest }: Props = $props()

  let rect = $state.raw<DOMRect | null>(null)

  const trackCutout: Attachment = () => {
    const element = cutout
    if (!element) {
      rect = null
      return
    }

    return autoUpdate(element, null, () => {
      const next = element.getBoundingClientRect()
      if (
        rect &&
        next.top === rect.top &&
        next.left === rect.left &&
        next.right === rect.right &&
        next.bottom === rect.bottom
      ) {
        return
      }
      rect = next
    })
  }

  const clipPath = $derived(
    rect
      ? `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`
      : undefined
  )
</script>

<!-- Present when the popup mounts so outside-press detection treats it as an existing element. -->
<div
  bind:this={ref}
  role="presentation"
  data-shards-ui-inert=""
  style:position="fixed"
  style:inset="0"
  style:user-select="none"
  style:-webkit-user-select="none"
  style:clip-path={clipPath}
  {...rest}
  {@attach trackCutout}
></div>
