<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import { MediaQuery } from 'svelte/reactivity'

  const LERP = 0.18
  const INTERACTIVE = 'a, button, [role="button"], [data-cursor-label]'

  const fine = new MediaQuery('(hover: hover) and (pointer: fine)')
  const calm = new MediaQuery('(prefers-reduced-motion: reduce)')

  // Written per pointer event and read per frame, never rendered — reactive would
  // only add overhead.
  let x = 0
  let y = 0

  let hovered = $state<HTMLElement | null>(null)
  let visible = $state(false)
  let pressed = $state(false)

  const label = $derived(hovered?.dataset.cursorLabel ?? '')
  const mode = $derived(!hovered ? 'default' : label ? 'label' : 'link')

  const closestInteractive = (node: EventTarget | null) =>
    node instanceof Element ? node.closest<HTMLElement>(INTERACTIVE) : null

  function track(event: PointerEvent) {
    x = event.clientX
    y = event.clientY
    visible = true
  }

  // A click can swap what sits under a motionless pointer — a dialog opens, a menu
  // closes — and no pointerover follows.
  function resyncHovered() {
    hovered = closestInteractive(document.elementFromPoint(x, y))
  }

  const follow: Attachment<HTMLElement> = (node) => {
    let currentX = x
    let currentY = y
    let frame: number

    // `calm.current` is read inside the callback, so it never re-runs the attachment.
    const tick = () => {
      if (calm.current) {
        currentX = x
        currentY = y
      } else {
        currentX += (x - currentX) * LERP
        currentY += (y - currentY) * LERP
      }
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => cancelAnimationFrame(frame)
  }
</script>

<svelte:document
  onpointermove={track}
  onpointerover={(event) => (hovered = closestInteractive(event.target))}
  onpointerdown={() => (pressed = true)}
  onpointerup={() => (pressed = false)}
  onpointercancel={() => (pressed = false)}
  onpointerleave={() => (visible = false)}
  onclick={resyncHovered}
/>

{#if fine.current}
  <div class="layer" data-mode={mode} class:visible class:pressed aria-hidden="true">
    <div class="pos" {@attach follow}>
      <div class="blob"><span class="label">{label}</span></div>
    </div>
  </div>
{/if}

<style>
  .layer {
    position: fixed;
    inset: 0;
    /* The site tops out at z-50; the native cursor still paints above all of this. */
    z-index: 100;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease-out;

    --ink: var(--color-foreground);
    --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .layer.visible {
    opacity: 1;
  }

  .pos {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
  }

  .blob {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: 0fr;
    align-items: center;
    justify-items: center;
    min-width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--ink) 18%, transparent);
    /* Separate translate/scale so the rAF-written transform on .pos stays untouched. */
    translate: -50% -50%;
    scale: 1;
    transition:
      scale 300ms var(--ease-brand),
      min-width 300ms var(--ease-brand),
      height 300ms var(--ease-brand),
      grid-template-columns 300ms var(--ease-brand),
      padding 300ms var(--ease-brand),
      background 200ms ease-out;
  }

  .layer[data-mode='link'] .blob {
    scale: 0.4;
    background: color-mix(in oklab, var(--ink) 60%, transparent);
  }

  /* Opaque: text on a translucent surface over arbitrary page content is unreadable. */
  .layer[data-mode='label'] .blob {
    min-width: 0;
    grid-template-columns: 1fr;
    height: 26px;
    padding-inline: 12px;
    background: var(--ink);
  }

  .label {
    overflow: hidden;
    min-width: 0;
    color: var(--color-content);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: var(--tracking-wide);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 120ms ease-out;
  }

  .layer[data-mode='label'] .label {
    opacity: 1;
    transition-delay: 120ms;
  }

  .layer.pressed .blob {
    scale: 0.85;
  }

  .layer[data-mode='link'].pressed .blob {
    scale: 0.32;
  }

  @media (prefers-reduced-motion: reduce) {
    .layer,
    .blob,
    .label {
      transition-duration: 1ms;
    }
  }
</style>
