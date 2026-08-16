# Animation

Transitions, keyframes, or JS animation libraries.

Nothing animates on its own. Every part mirrors its state onto `data-*` attributes for you to style against, adds a few more that exist only for animation, and holds a closing element in the DOM until its animation has finished.

## Enter and exit with CSS transitions

Two attributes bracket the transition of anything that opens and closes:

- `[data-starting-style]`: the style to transition **from** as the element enters.
- `[data-ending-style]`: the style to transition **to** as the element leaves.

Both sit on the animated part (a popup, a backdrop, a panel) only while it's in motion. Put your resting styles on the element and your extremes behind these two selectors:

```css title="popover.css"
.popup {
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  background-color: canvas;
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms,
    opacity 150ms;

  /* [!code highlight:5] */
  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

Prefer a transition to a keyframe animation. A transition is reversible mid-flight: a popup dismissed before it finishes opening glides straight back to closed, with no jump and no restart. A keyframe animation has to run to completion, so it visibly snaps when interrupted.

`--transform-origin` above is set for you on the positioner and inherited by the popup. It points the scale at the trigger, so the popup grows out of the element that spawned it rather than its own center.

## Keyframe animations

When you want a motion a transition can't express — a spin, a multi-step ease, a bounce — drive it from keyframes keyed off the open/closed state:

- `[data-open]`: present while the element is visible.
- `[data-closed]`: present while it's hidden (including during the exit).

```css title="popover.css"
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.popup[data-open] {
  animation: scale-in 250ms ease-out;
}

.popup[data-closed] {
  animation: scale-out 250ms ease-in;
}
```

## Animating size

Components that expand and collapse — [Collapsible](/svelte/collapsible) and [Accordion](/svelte/accordion) — can't transition to `height: auto`; the browser won't interpolate to an intrinsic size. So they measure the content for you and publish it as a CSS variable on the panel, giving you a concrete pixel target to animate between:

- `--collapsible-panel-height` / `--collapsible-panel-width` on `<Collapsible.Panel>`.
- `--accordion-panel-height` / `--accordion-panel-width` on `<Accordion.Panel>`.

Transition the panel from `0` to the measured size, and clip the overflow so the contents don't spill while it's mid-open:

```css title="collapsible.css"
.panel {
  overflow: hidden;
  transition: height 150ms ease-out;

  /* [!code word:--collapsible-panel-height] */
  /* [!code highlight] */
  height: var(--collapsible-panel-height);
}

.panel[data-starting-style],
.panel[data-ending-style] {
  height: 0;
}
```

The same `[data-starting-style]` / `[data-ending-style]` pair works here.

## How the exit is detected

A closing popup gains `[data-closed]` and `[data-ending-style]`, and is removed a frame later, once every animation on it has finished. The library finds those animations by calling [`element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations) on the element itself. CSS transitions, CSS keyframe animations and Web Animations API calls all register there.

The check is scoped to that one element, not its subtree, so an animation on a child of the popup doesn't count and the popup is hidden out from under it. An element with no animation at all is removed immediately, which is what makes an unstyled component feel instant rather than delayed.

## Keeping elements mounted

`keepMounted` keeps the element in the DOM while closed: hidden, but present, so its contents keep their scroll position and DOM state across open and close. Set it on the overlay's `Portal` part: `<Popover.Portal>` for anchored overlays, `<Dialog.Portal>` / `<Drawer.Portal>` for modal ones.

```svelte title="Keep the popup mounted"
<!-- [!code word:keepMounted] -->
<Popover.Portal keepMounted>
  <Popover.Positioner>
    <Popover.Popup>...</Popover.Popup>
  </Popover.Positioner>
</Popover.Portal>
```

```svelte title="Keep a dialog mounted"
<!-- [!code word:keepMounted] -->
<Dialog.Portal keepMounted>
  <Dialog.Popup>...</Dialog.Popup>
</Dialog.Portal>
```

Collapsible and Accordion panels take `keepMounted` directly on the panel part:

```svelte title="Keep panel contents mounted"
<!-- [!code word:keepMounted] -->
<Collapsible.Panel keepMounted>...</Collapsible.Panel>
```

## JavaScript animations

For motion CSS can't reach — physics-based springs, gesture-linked timelines, an imperative library — animate the popup element yourself with `{@attach}`. A part spreads its leftover props onto the element it renders, so an attachment written on the part lands on that element, which is exactly where the library looks for animations. Read `open` inside the attachment and Svelte re-runs it on every change, so one function plays both directions:

```svelte title="Animate with {@attach}"
<script>
  import { Popover } from '@shardsui/svelte/popover'
  import { animate } from 'motion'

  let open = $state(false)

  function popupAnimation(node) {
    animate(node, open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }, { duration: 0.2 })
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>Trigger</Popover.Trigger>
  <!-- [!code word:keepMounted] -->
  <Popover.Portal keepMounted>
    <Popover.Positioner>
      <!-- [!code word:popupAnimation] -->
      <!-- [!code highlight] -->
      <Popover.Popup {@attach popupAnimation}>Popup</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

`keepMounted` is required here: the popup survives the close, so the next open animates from the values the exit left behind. A freshly mounted element sits at its resting style with nothing to animate from, so the very first open has no enter animation. Use `[data-starting-style]` if you need one.

Not every library reports its work to `getAnimations()`. Motion registers `opacity` animations, so a part that only translates — a drawer that slides, say — can have nothing to report at the moment of removal, and vanishes without its exit. Animate `opacity` as well, to a barely-perceptible value like `0.9999`, so the exit registers.

Svelte's `transition:` directives are the one thing that can't work here. A directive only applies to an element you render yourself, and an animation on a child of the popup is invisible to the check above, so the popup is hidden while the outro is still playing. Attach to the part instead.

## Instant changes

Some changes shouldn't animate at all: a tooltip opened by keyboard focus, a popup dismissed with Escape, a menubar handing its menu from one trigger to the next. Those get `[data-instant]`. The library only marks them. Cancelling the motion is yours to do:

```css title="popover.css"
.popup[data-instant] {
  transition-duration: 0s;
}
```

## Respect reduced motion

Some people disable motion at the OS level. Honor that with the `prefers-reduced-motion` media query: author your resting styles with no motion, then layer transitions on only when motion is welcome.

```css title="popover.css"
.popup {
  transform-origin: var(--transform-origin);

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 150ms,
      opacity 150ms;
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

With no transition the element snaps between its extremes and its resting state, and there's nothing to wait on, so unmount stays immediate. Keep the opacity or a color shift if you still want a fade; strip only the transforms that move things across the screen.
