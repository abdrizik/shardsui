<script lang="ts">
  import { on } from 'svelte/events'
  import { createSubscriber } from 'svelte/reactivity'
  import { innerHeight, innerWidth } from 'svelte/reactivity/window'

  const RULER_TOP = 21
  const RULER_LEFT = 22
  const TICK_STEP = 8
  const MID_STEP = 16
  const LABEL_STEP = 32
  const READOUT_OFFSET = 10
  const READOUT_MARGIN = 8
  const PORTAL_SELECTOR = '[data-shards-ui-portal]'

  type Box = { left: number; top: number; width: number; height: number }
  type Strip = Box & { id: string; label: string }

  type Font = {
    size: string
    family: string
    weight: string
    tracking: string
    color: string
  }

  type Target = Box & {
    content: Box
    marginStrips: Strip[]
    padStrips: Strip[]
    gapStrips: Strip[]
    tag: string
    display: string
    size: string
    padding: string
    margin: string
    gap: string | null
    font: Font | null
  }

  type Tick = {
    pos: number
    value: number
    inside: boolean
    labeled: boolean
    length: number
  }

  type Props = {
    content: HTMLElement
    onclose: () => void
  }

  let { content, onclose }: Props = $props()

  let hovered = $state<HTMLElement | null>(null)
  let readoutWidth = $state(0)
  let readoutHeight = $state(0)

  const track = createSubscriber((update) => {
    const observer = new ResizeObserver(update)
    observer.observe(content)
    if (content.firstElementChild) observer.observe(content.firstElementChild)
    const offScroll = on(window, 'scroll', update, { capture: true, passive: true })

    return () => {
      observer.disconnect()
      offScroll()
    }
  })

  const portal = (node: HTMLElement) => {
    node.ownerDocument.body.appendChild(node)
    return () => node.remove()
  }

  let swatch: CanvasRenderingContext2D | null = null

  function toHex(color: string) {
    const fromRgb = (value: string) => {
      const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(value)
      if (!match) return null
      const channel = (part: string) =>
        Math.round(Number.parseFloat(part)).toString(16).padStart(2, '0')
      return `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`
    }

    const direct = fromRgb(color)
    if (direct) return direct

    swatch ??= document.createElement('canvas').getContext('2d')
    if (!swatch) return color
    swatch.fillStyle = '#000000'
    swatch.fillStyle = color
    const resolved = swatch.fillStyle
    if (typeof resolved !== 'string') return color
    if (resolved.startsWith('#')) return resolved
    return fromRgb(resolved) ?? color
  }

  function boxShorthand(top: number, right: number, bottom: number, left: number) {
    const round = Math.round
    if (top === right && right === bottom && bottom === left) return `${round(top)}px`
    if (top === bottom && left === right) return `${round(top)}px ${round(right)}px`
    return `${round(top)}px ${round(right)}px ${round(bottom)}px ${round(left)}px`
  }

  function px(style: CSSStyleDeclaration, property: string) {
    return Number.parseFloat(style.getPropertyValue(property)) || 0
  }

  function readFont(element: HTMLElement, style: CSSStyleDeclaration): Font | null {
    const wrapsText = Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0
    )
    if (!wrapsText) return null

    const lineHeight =
      style.lineHeight === 'normal'
        ? 'normal'
        : `${Math.round(Number.parseFloat(style.lineHeight))}px`

    const axes = style.fontVariationSettings
    let weight = style.fontWeight
    if (axes && axes !== 'normal') {
      const wght = /wght["'\s]+([\d.]+)/.exec(axes)?.[1]
      const opsz = /opsz["'\s]+([\d.]+)/.exec(axes)?.[1]
      const parts = [wght && `wght ${wght}`, opsz && `opsz ${opsz}`].filter(Boolean)
      if (parts.length > 0) weight = parts.join(' · ')
    }

    return {
      size: `${Math.round(Number.parseFloat(style.fontSize))}px / ${lineHeight}`,
      family: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      weight,
      tracking:
        style.letterSpacing === 'normal' || style.letterSpacing === '0px'
          ? '0'
          : style.letterSpacing,
      color: toHex(style.color)
    }
  }

  function ringStrips(outer: Box, inner: Box): Strip[] {
    const outerRight = outer.left + outer.width
    const outerBottom = outer.top + outer.height
    const innerRight = inner.left + inner.width
    const innerBottom = inner.top + inner.height

    return [
      {
        id: 'top',
        left: outer.left,
        top: outer.top,
        width: outer.width,
        height: inner.top - outer.top
      },
      {
        id: 'bottom',
        left: outer.left,
        top: innerBottom,
        width: outer.width,
        height: outerBottom - innerBottom
      },
      {
        id: 'left',
        left: outer.left,
        top: inner.top,
        width: inner.left - outer.left,
        height: inner.height
      },
      {
        id: 'right',
        left: innerRight,
        top: inner.top,
        width: outerRight - innerRight,
        height: inner.height
      }
    ]
      .filter((strip) => strip.width > 0 && strip.height > 0)
      .map((strip) => ({
        ...strip,
        label: String(Math.round(Math.min(strip.width, strip.height)))
      }))
  }

  function gapStrips(element: HTMLElement): Strip[] {
    const strips: Strip[] = []
    const children = Array.from(element.children).map((child) => child.getBoundingClientRect())

    for (let index = 0; index < children.length - 1; index++) {
      const a = children[index]
      const b = children[index + 1]
      const columnGap = b.left - a.right
      const rowGap = b.top - a.bottom

      if (columnGap > 1) {
        strips.push({
          id: `gap-${index}`,
          left: a.right,
          top: Math.min(a.top, b.top),
          width: columnGap,
          height: Math.max(a.height, b.height),
          label: String(Math.round(columnGap))
        })
      } else if (rowGap > 1) {
        strips.push({
          id: `gap-${index}`,
          left: Math.min(a.left, b.left),
          top: a.bottom,
          width: Math.max(a.width, b.width),
          height: rowGap,
          label: String(Math.round(rowGap))
        })
      }
    }
    return strips
  }

  function measure(element: HTMLElement): Target {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)

    const pt = px(style, 'padding-top')
    const pr = px(style, 'padding-right')
    const pb = px(style, 'padding-bottom')
    const pl = px(style, 'padding-left')
    const mt = px(style, 'margin-top')
    const mr = px(style, 'margin-right')
    const mb = px(style, 'margin-bottom')
    const ml = px(style, 'margin-left')

    const box: Box = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    const contentBox: Box = {
      left: box.left + pl,
      top: box.top + pt,
      width: Math.max(0, box.width - pl - pr),
      height: Math.max(0, box.height - pt - pb)
    }
    const marginBox: Box = {
      left: box.left - ml,
      top: box.top - mt,
      width: box.width + ml + mr,
      height: box.height + mt + mb
    }

    const laysOutChildren = style.display.includes('flex') || style.display.includes('grid')
    const gap = Math.max(px(style, 'column-gap'), px(style, 'row-gap'))
    const direction = style.display.includes('flex')
      ? ` ${style.flexDirection.startsWith('column') ? 'col' : 'row'}`
      : ''

    return {
      ...box,
      content: contentBox,
      marginStrips: ringStrips(marginBox, box),
      padStrips: ringStrips(box, contentBox),
      gapStrips: laysOutChildren ? gapStrips(element) : [],
      tag: element.tagName.toLowerCase(),
      display: `${style.display}${direction}`,
      size: `${Math.round(box.width)} × ${Math.round(box.height)}`,
      padding: boxShorthand(pt, pr, pb, pl),
      margin: boxShorthand(mt, mr, mb, ml),
      gap: laysOutChildren && gap > 0 ? `${Math.round(gap)}px` : null,
      font: readFont(element, style)
    }
  }

  function inspectable(node: EventTarget | null) {
    if (!(node instanceof HTMLElement) || node === content) return null
    if (node.closest('[data-inspect-ui]')) return null
    if (!content.contains(node) && !node.closest(PORTAL_SELECTOR)) return null
    return node
  }

  const frame = $derived.by(() => {
    track()
    return {
      left: content.offsetLeft,
      top: content.offsetTop,
      width: content.offsetWidth,
      height: content.offsetHeight
    }
  })

  const contentRect = $derived.by(() => {
    track()
    return content.getBoundingClientRect()
  })

  const component = $derived.by(() => {
    const rect = (content.firstElementChild ?? content).getBoundingClientRect()
    return {
      left: rect.left - contentRect.left,
      top: rect.top - contentRect.top,
      width: rect.width,
      height: rect.height
    }
  })

  const target = $derived.by(() => {
    track()
    return hovered?.isConnected ? measure(hovered) : null
  })

  const inFrame = $derived(hovered !== null && content.contains(hovered))

  const band = $derived(
    target && {
      left: target.left - contentRect.left,
      top: target.top - contentRect.top,
      width: target.width,
      height: target.height
    }
  )

  function ticks(origin: number, extent: number, total: number, min: number) {
    const out: Tick[] = []
    if (total <= 0) return out

    const first = Math.ceil(-origin / TICK_STEP)
    const last = Math.floor((total - origin) / TICK_STEP)

    for (let step = first; step <= last; step++) {
      const value = step * TICK_STEP
      const pos = origin + value
      if (pos < min) continue
      const inside = value >= 0 && value <= extent + 0.5
      const labeled = inside && value % LABEL_STEP === 0
      out.push({
        pos,
        value,
        inside,
        labeled,
        length: labeled ? 8 : value % MID_STEP === 0 ? 6 : 3
      })
    }
    return out
  }

  const xTicks = $derived(ticks(component.left, component.width, frame.width, RULER_LEFT))
  const yTicks = $derived(ticks(component.top, component.height, frame.height, RULER_TOP))

  const readout = $derived.by(() => {
    if (!target) return null
    const fitsAbove = target.top - READOUT_OFFSET - readoutHeight >= READOUT_MARGIN
    const clamp = (value: number, extent: number, size: number) =>
      Math.max(READOUT_MARGIN, Math.min(value, extent - size - READOUT_MARGIN))

    return {
      left: clamp(
        target.left + target.width / 2 - readoutWidth / 2,
        innerWidth.current ?? 0,
        readoutWidth
      ),
      top: clamp(
        fitsAbove
          ? target.top - READOUT_OFFSET - readoutHeight
          : target.top + target.height + READOUT_OFFSET,
        innerHeight.current ?? 0,
        readoutHeight
      ),
      side: fitsAbove ? 'top' : 'bottom'
    }
  })
</script>

<svelte:window
  onkeydown={(event) => event.key === 'Escape' && onclose()}
  onpointerover={(event) => (hovered = inspectable(event.target))}
/>

<div
  class="inspect-rulers"
  data-inspect-ui
  style:left={`${frame.left}px`}
  style:top={`${frame.top}px`}
  style:width={`${frame.width}px`}
  style:height={`${frame.height}px`}
>
  <svg class="inspect-ruler-top" width={frame.width} height={RULER_TOP} aria-hidden="true">
    <rect x="0" y="0" width={frame.width} height={RULER_TOP} class="inspect-ruler-surface" />
    {#if band}
      <rect
        x={Math.max(band.left, RULER_LEFT)}
        y="0"
        width={Math.max(0, band.width - Math.max(0, RULER_LEFT - band.left))}
        height={RULER_TOP}
        class="inspect-band"
      />
    {/if}
    {#each xTicks as tick (tick.value)}
      <line
        x1={tick.pos}
        y1="0"
        x2={tick.pos}
        y2={tick.length}
        class="inspect-tick"
        data-inside={tick.inside ? '' : undefined}
        data-labeled={tick.labeled ? '' : undefined}
      />
      {#if tick.labeled}
        <text x={tick.pos} y="19" class="inspect-tick-label" text-anchor="middle">{tick.value}</text
        >
      {/if}
    {/each}
  </svg>

  <svg class="inspect-ruler-left" width={RULER_LEFT} height={frame.height} aria-hidden="true">
    <rect x="0" y="0" width={RULER_LEFT} height={frame.height} class="inspect-ruler-surface" />
    {#if band}
      <rect
        x="0"
        y={Math.max(band.top, RULER_TOP)}
        width={RULER_LEFT}
        height={Math.max(0, band.height - Math.max(0, RULER_TOP - band.top))}
        class="inspect-band"
      />
    {/if}
    {#each yTicks as tick (tick.value)}
      <line
        x1="0"
        y1={tick.pos}
        x2={tick.length}
        y2={tick.pos}
        class="inspect-tick"
        data-inside={tick.inside ? '' : undefined}
        data-labeled={tick.labeled ? '' : undefined}
      />
      {#if tick.labeled}
        <text
          x="19"
          y={tick.pos}
          class="inspect-tick-label"
          text-anchor="middle"
          dominant-baseline="middle"
          transform={`rotate(-90 19 ${tick.pos})`}>{tick.value}</text
        >
      {/if}
    {/each}
  </svg>
</div>

<div {@attach portal} class="inspect-viewport" data-inspect-ui>
  {#if target}
    {@render strips(target.marginStrips, 'inspect-margin')}

    <div
      class="inspect-content"
      style:left={`${target.content.left}px`}
      style:top={`${target.content.top}px`}
      style:width={`${target.content.width}px`}
      style:height={`${target.content.height}px`}
    ></div>

    {@render strips(target.padStrips, 'inspect-padding')}
    {@render strips(target.gapStrips, 'inspect-gap')}

    {#if inFrame}
      {@render guide('v', target.left)}
      {@render guide('v', target.left + target.width)}
      {@render guide('h', target.top)}
      {@render guide('h', target.top + target.height)}
    {/if}

    <div
      class="inspect-outline"
      style:left={`${target.left}px`}
      style:top={`${target.top}px`}
      style:width={`${target.width}px`}
      style:height={`${target.height}px`}
    ></div>
  {/if}

  {#if target && readout}
    <div
      class="inspect-readout"
      bind:clientWidth={readoutWidth}
      bind:clientHeight={readoutHeight}
      style:left={`${readout.left}px`}
      style:top={`${readout.top}px`}
      data-side={readout.side}
    >
      <div class="inspect-readout-head">
        <span class="inspect-readout-tag">{target.tag}</span>
        <span class="inspect-readout-size">{target.size}</span>
      </div>

      <dl class="inspect-readout-rows">
        <dt>display</dt>
        <dd>{target.display}</dd>

        <dt>padding</dt>
        <dd>{target.padding}</dd>

        <dt>margin</dt>
        <dd>{target.margin}</dd>

        {#if target.gap}
          <dt>gap</dt>
          <dd>{target.gap}</dd>
        {/if}

        {#if target.font}
          <dt>font</dt>
          <dd>{target.font.size}</dd>

          <dt>family</dt>
          <dd>{target.font.family} · {target.font.weight}</dd>

          <dt>tracking</dt>
          <dd>{target.font.tracking}</dd>

          <dt>color</dt>
          <dd class="inspect-readout-color">
            <span class="inspect-readout-chip" style:background-color={target.font.color}></span>
            {target.font.color}
          </dd>
        {/if}
      </dl>
    </div>
  {/if}
</div>

{#snippet strips(items: Strip[], variant: string)}
  {#each items as strip (strip.id)}
    <div
      class={['inspect-strip', variant]}
      style:left={`${strip.left}px`}
      style:top={`${strip.top}px`}
      style:width={`${strip.width}px`}
      style:height={`${strip.height}px`}
    >
      <span>{strip.label}</span>
    </div>
  {/each}
{/snippet}

{#snippet guide(axis: 'v' | 'h', offset: number)}
  <div
    class={['inspect-guide', `inspect-guide-${axis}`]}
    style:left={`${axis === 'v' ? offset : contentRect.left}px`}
    style:top={`${axis === 'h' ? offset : contentRect.top}px`}
    style:width={axis === 'h' ? `${contentRect.width}px` : undefined}
    style:height={axis === 'v' ? `${contentRect.height}px` : undefined}
  ></div>
{/snippet}

<style>
  .inspect-rulers,
  .inspect-viewport {
    --inspect-accent: light-dark(var(--color-red-600), var(--color-red-400));
    --inspect-content-base: light-dark(var(--color-blue-500), var(--color-blue-400));
    --inspect-padding-base: light-dark(var(--color-emerald-500), var(--color-emerald-400));
    --inspect-margin-base: light-dark(var(--color-amber-500), var(--color-amber-400));
    --inspect-gap-base: light-dark(var(--color-pink-500), var(--color-pink-400));

    --inspect-content: color-mix(in oklab, var(--inspect-content-base) 20%, transparent);
    --inspect-padding: color-mix(in oklab, var(--inspect-padding-base) 30%, transparent);
    --inspect-margin: color-mix(in oklab, var(--inspect-margin-base) 28%, transparent);
    --inspect-gap: color-mix(in oklab, var(--inspect-gap-base) 26%, transparent);
    --inspect-margin-edge: color-mix(in oklab, var(--inspect-margin-base) 55%, transparent);
    --inspect-gap-edge: color-mix(in oklab, var(--inspect-gap-base) 60%, transparent);
    --inspect-band: color-mix(in oklab, var(--inspect-accent) 16%, transparent);
  }

  .inspect-viewport {
    animation: inspect-in 140ms var(--ease-out) both;
  }

  .inspect-rulers {
    position: absolute;
    z-index: 3;
    pointer-events: none;
  }

  .inspect-viewport {
    position: fixed;
    inset: 0;
    z-index: 101;
    pointer-events: none;
    overflow: hidden;
  }

  :global(body:has(.inspect-viewport)) {
    cursor: crosshair;
  }

  .inspect-content {
    position: absolute;
    background-color: var(--inspect-content);
  }

  .inspect-outline {
    position: absolute;
    outline: 1px solid var(--inspect-accent);
    outline-offset: -1px;
  }

  .inspect-strip {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .inspect-padding {
    background-color: var(--inspect-padding);
  }
  .inspect-margin {
    background-color: var(--inspect-margin);
    box-shadow: inset 0 0 0 1px var(--inspect-margin-edge);
  }
  .inspect-gap {
    background-color: var(--inspect-gap);
    box-shadow: inset 0 0 0 1px var(--inspect-gap-edge);
  }
  .inspect-strip span {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--color-gray-700);
  }

  .inspect-guide {
    position: absolute;
    background-color: var(--inspect-accent);
    opacity: 0.25;
  }
  .inspect-guide-v {
    inline-size: 1px;
  }
  .inspect-guide-h {
    block-size: 1px;
  }

  .inspect-ruler-top,
  .inspect-ruler-left {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    overflow: visible;
  }
  .inspect-ruler-top {
    animation: inspect-ruler-top-in 200ms var(--ease-out-quart) both;
  }
  .inspect-ruler-left {
    animation: inspect-ruler-left-in 200ms var(--ease-out-quart) both;
  }

  .inspect-ruler-surface {
    fill: var(--color-content);
  }

  .inspect-band {
    fill: var(--inspect-band);
  }

  .inspect-tick {
    stroke: var(--color-gray-400);
    stroke-width: 1;
  }
  .inspect-tick[data-inside] {
    stroke: var(--color-gray-500);
  }
  .inspect-tick[data-labeled] {
    stroke: var(--color-gray-700);
  }

  .inspect-tick-label {
    fill: var(--color-gray-700);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
  }

  .inspect-readout {
    --readout-padding: calc(var(--spacing) * 2.5);
    position: absolute;
    inline-size: max-content;
    max-inline-size: calc(var(--spacing) * 72);
    padding: var(--readout-padding);
    border-radius: var(--radius-md);
    background-color: var(--color-gray-50);
    box-shadow:
      0 0 0 1px light-dark(oklch(0 0 0 / 0.07), oklch(1 0 0 / 0.09)),
      0 8px 24px -12px oklch(0 0 0 / 0.18);
    font-family: var(--font-mono);
    font-size: var(--text-code);
    font-variant-numeric: tabular-nums;
    line-height: calc(var(--spacing) * 4.5);
    --readout-origin: 50% 100%;
    --readout-offset: 4px;
    transform-origin: var(--readout-origin);
    animation: inspect-readout-in 180ms var(--ease-out-quart) both;
  }
  .inspect-readout[data-side='bottom'] {
    --readout-origin: 50% 0%;
    --readout-offset: -4px;
  }

  .inspect-readout-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: calc(var(--spacing) * 6);
    margin-block-end: calc(var(--spacing) * 1.5);
  }
  .inspect-readout-tag {
    font-weight: 500;
    color: var(--color-gray-900);
  }
  .inspect-readout-size {
    color: var(--color-gray-500);
  }

  .inspect-readout-rows {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: calc(var(--spacing) * 4);
    margin: 0;
  }
  .inspect-readout-rows dt {
    font-weight: 500;
    color: var(--color-gray-800);
  }
  .inspect-readout-rows dd {
    margin: 0;
    color: var(--color-gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inspect-readout-color {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 1.5);
  }
  .inspect-readout-chip {
    inline-size: calc(var(--spacing) * 2.5);
    block-size: calc(var(--spacing) * 2.5);
    border-radius: var(--radius-sm);
    box-shadow: inset 0 0 0 1px var(--color-image-outline);
  }

  @keyframes inspect-in {
    from {
      opacity: 0;
    }
  }
  @keyframes inspect-readout-in {
    from {
      opacity: 0;
      scale: 0.97;
      translate: 0 var(--readout-offset);
    }
  }
  @keyframes inspect-ruler-top-in {
    from {
      opacity: 0;
      translate: 0 -6px;
    }
  }
  @keyframes inspect-ruler-left-in {
    from {
      opacity: 0;
      translate: -6px 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    .inspect-readout {
      box-shadow: 0 0 0 1px oklch(1 0 0 / 0.09);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inspect-rulers,
    .inspect-viewport,
    .inspect-ruler-top,
    .inspect-ruler-left,
    .inspect-readout {
      animation: none;
    }
  }
</style>
