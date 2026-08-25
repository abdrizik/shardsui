<script lang="ts" module>
  import { prefersReducedMotion } from 'svelte/motion'

  type Segment = { id: string; text: string }
  type Diff = { segments: Segment[]; changeRatio: number }

  const DURATION = 250
  const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
  const SCALE = 0.97
  const MAX_DRIFT = 12
  const MAX_DIFF = 64

  function morphTo(root: HTMLElement, { segments, changeRatio }: Diff) {
    const width = root.getBoundingClientRect().width
    const before = measure(root)
    const ids = new Set(segments.map((segment) => segment.id))
    const live = liveGlyphs(root)
    const exiting = live.filter((glyph) => !ids.has(idOf(glyph)))

    detach(root, exiting)
    reconcile(root, segments)

    const after = measure(root)
    const glyphs = liveGlyphs(root)

    glyphs.forEach((glyph, index) => {
      const previous = before.get(idOf(glyph))
      if (previous === undefined) enter(glyph, drift(index, glyphs.length, changeRatio))
      else shift(glyph, previous - after.get(idOf(glyph))!)
    })

    for (const glyph of exiting) {
      dismiss(glyph, drift(live.indexOf(glyph), live.length, changeRatio))
    }

    slide(root, width, root.getBoundingClientRect().width)
  }

  function drift(index: number, total: number, changeRatio: number) {
    if (total <= 1) return 0
    return (index / (total - 1) - 0.5) * MAX_DRIFT * changeRatio
  }

  function move(element: HTMLElement, from: string) {
    element.animate([{ transform: from }, { transform: 'none' }], {
      duration: DURATION,
      easing: EASING,
      fill: 'both'
    })
  }

  function fade(
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    fraction: number,
    delay = 0
  ) {
    return element.animate(keyframes, {
      duration: DURATION * fraction,
      delay: DURATION * delay,
      easing: 'linear',
      fill: 'both'
    })
  }

  function enter(glyph: HTMLElement, offset: number) {
    move(glyph, `translateX(${offset}px) scale(${SCALE})`)
    fade(glyph, [{ opacity: 0 }, { opacity: 1 }], 0.5, 0.25)
  }

  function shift(glyph: HTMLElement, offset: number) {
    const { x, opacity } = interrupt(glyph)

    if (offset + x) move(glyph, `translateX(${offset + x}px)`)
    if (opacity < 1) fade(glyph, [{ opacity }, { opacity: 1 }], 0.25)
  }

  function dismiss(glyph: HTMLElement, offset: number) {
    // Single keyframes, so both animations start from where `detach` pinned the glyph.
    glyph.animate(
      { transform: `translateX(${offset}px) scale(${SCALE})`, offset: 1 },
      { duration: DURATION, easing: EASING, fill: 'both' }
    )

    fade(glyph, { opacity: 0, offset: 1 }, 0.25).onfinish = () => glyph.remove()
  }

  function slide(root: HTMLElement, from: number, to: number) {
    const offset = to - from + interrupt(root).x
    if (from && offset) move(root, `translateX(${offset}px)`)
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

  let counter = 0

  function diff(previous: Segment[], text: string): Diff {
    const graphemes = Array.from(segmenter.segment(text), ({ segment }) => segment)
    const longest = Math.max(graphemes.length, previous.length)
    const kept: (string | undefined)[] = Array.from({ length: graphemes.length })

    const matched =
      longest > MAX_DIFF
        ? []
        : commonSubsequence(
            previous.map((segment) => segment.text),
            graphemes
          )

    for (const [from, to] of matched) kept[to] = previous[from].id

    const segments = graphemes.map((grapheme, index) => ({
      id: kept[index] ?? `g${counter++}`,
      text: grapheme
    }))

    const changed = graphemes.length + previous.length - 2 * matched.length
    return { segments, changeRatio: longest ? Math.min(changed / longest, 1) : 0 }
  }

  function commonSubsequence(before: string[], after: string[]) {
    const lengths: number[][] = Array.from({ length: before.length + 1 }, () =>
      Array.from({ length: after.length + 1 }, () => 0)
    )

    for (let i = 1; i <= before.length; i++) {
      for (let j = 1; j <= after.length; j++) {
        lengths[i][j] =
          before[i - 1] === after[j - 1]
            ? lengths[i - 1][j - 1] + 1
            : Math.max(lengths[i - 1][j], lengths[i][j - 1])
      }
    }

    const pairs: [number, number][] = []
    let i = before.length
    let j = after.length

    while (i > 0 && j > 0) {
      if (before[i - 1] === after[j - 1]) pairs.push([--i, --j])
      else if (lengths[i - 1][j] >= lengths[i][j - 1]) i--
      else j--
    }

    return pairs
  }

  function createGlyph({ id, text }: Segment) {
    const glyph = document.createElement('span')
    glyph.setAttribute('data-morph-id', id)
    glyph.textContent = text
    // A collapsible space in an inline-block glyph has zero width.
    Object.assign(glyph.style, { display: 'inline-block', whiteSpace: 'pre' })
    return glyph
  }

  function idOf(glyph: HTMLElement) {
    return glyph.getAttribute('data-morph-id')!
  }

  function liveGlyphs(root: HTMLElement) {
    return Array.from(root.children).filter(
      (child): child is HTMLElement => !child.hasAttribute('data-morph-exiting')
    )
  }

  function visualState(element: HTMLElement) {
    const { transform, opacity } = getComputedStyle(element)
    const matrix = transform === 'none' ? undefined : new DOMMatrixReadOnly(transform)
    return { x: matrix?.m41 ?? 0, opacity: Number(opacity) }
  }

  function cancelAnimations(element: HTMLElement) {
    element.getAnimations().forEach((animation) => animation.cancel())
  }

  function interrupt(glyph: HTMLElement) {
    const state = visualState(glyph)
    cancelAnimations(glyph)
    return state
  }

  function measure(root: HTMLElement) {
    const origin = root.getBoundingClientRect().left

    return new Map(
      liveGlyphs(root).map((glyph) => [
        idOf(glyph),
        glyph.getBoundingClientRect().left - origin - visualState(glyph).x
      ])
    )
  }

  function detach(root: HTMLElement, exiting: HTMLElement[]) {
    const origin = root.getBoundingClientRect()

    // Every rect is read before any style is written, or each write forces a reflow.
    const snapshots = exiting.map((glyph) => ({
      glyph,
      rect: glyph.getBoundingClientRect(),
      opacity: visualState(glyph).opacity
    }))

    for (const { glyph, rect, opacity } of snapshots) {
      cancelAnimations(glyph)
      glyph.setAttribute('data-morph-exiting', '')
      Object.assign(glyph.style, {
        position: 'absolute',
        pointerEvents: 'none',
        left: `${rect.left - origin.left}px`,
        top: `${rect.top - origin.top}px`,
        opacity: String(opacity)
      })
    }
  }

  function reconcile(root: HTMLElement, segments: Segment[]) {
    const reusable = new Map(liveGlyphs(root).map((glyph) => [idOf(glyph), glyph]))
    // Appending an already-attached glyph moves it, so this both reorders and inserts.
    root.append(...segments.map((segment) => reusable.get(segment.id) ?? createGlyph(segment)))
  }
</script>

<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import type { HTMLAttributes } from 'svelte/elements'

  type Props = HTMLAttributes<HTMLSpanElement> & {
    text: string
  }

  let { text, class: classProp, ...rest }: Props = $props()

  const morph: Attachment<HTMLElement> = (node) => {
    let applied: string | null = null
    let previous: Segment[] = []

    $effect(() => {
      if (text === applied) return

      const isInitial = applied === null
      applied = text
      const changes = diff(previous, text)
      previous = changes.segments

      if (isInitial || prefersReducedMotion.current) {
        cancelAnimations(node)
        node.replaceChildren(...changes.segments.map(createGlyph))
      } else {
        morphTo(node, changes)
      }
    })
  }
</script>

<span class={['text-morph', classProp]} {...rest}>
  <span class="sr-only">{text}</span>
  <span class="glyphs" aria-hidden="true" {@attach morph}>{text}</span>
</span>

<style>
  .text-morph {
    display: inline-block;
    position: relative;
    vertical-align: top;
    white-space: nowrap;
  }

  .glyphs {
    display: inline-block;
    position: relative;
  }
</style>
