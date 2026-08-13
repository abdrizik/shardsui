# Accessibility

What components handle, and what you still own.

Compose the parts and you inherit the ARIA roles and attributes, pointer and keyboard interaction, and focus management the pattern calls for — tunable through props. What's left is what a headless library can't decide: visible focus, color contrast, accessible names for your own controls, and reduced motion.

## Keyboard navigation

Every component follows the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), so keyboard support works the moment you render it — for people who can't use a pointer, and for anyone who prefers the keyboard. Depending on the component, that covers the arrow keys, alphanumeric typeahead, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Enter</kbd>, and <kbd>Esc</kbd>.

The handlers already sit on the parts, so you never wire them. To change what a key does, reach for the component's own props — `closeOnClick`, `loopFocus`, `modal` — rather than layering your own `onkeydown` on top: a handler you pass is [chained onto the part's](/svelte/composition#merging-your-own-attributes), so both run.

## Focus management

Focus follows interaction on its own — into the overlay when it opens, back to the trigger when it closes. When the default landing spot is wrong, `initialFocus` and `finalFocus` point it at a specific element:

```svelte title="Dialog initial focus"
<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  let confirmButton = $state<HTMLElement | null>(null)
</script>

<Dialog.Popup initialFocus={() => confirmButton}>
  <button bind:this={confirmButton}>Confirm</button>
</Dialog.Popup>
```

Both take an element, but a rune that starts empty is `HTMLElement | null`, so pass a getter — it's read at the moment focus moves, when the element exists. Both also take `false` to skip focusing entirely, and the function form receives the interaction type (`'mouse'`, `'keyboard'`, `'touch'`, `'pen'`) so the target can differ per input mode.

Moving focus is handled; making it _visible_ is on you. Style `:focus-visible` — not `:focus`, which also fires on mouse clicks — with a ring that clears the [WCAG focus-appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) thresholds.

## Color contrast

As you style, hold enough contrast between each foreground element and whatever sits behind it to clear the minimum thresholds. Unless a specific standard binds you, measure against [APCA](https://apcacontrast.com/) — it accounts for font size and weight; [WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) 2 ratios do not.

## Accessible labels

Wrap form controls in [Field](/svelte/field) and `<Field.Control>` is wired to its `<Field.Label>`, `<Field.Description>`, and `<Field.Error>` for you — `for` on a native label, `aria-labelledby` and `aria-describedby` everywhere else. [Fieldset](/svelte/fieldset) does the same for a group and its legend. See the [Forms guide](/svelte/forms) for the whole shape.

Everything else needs a name you supply. Icon-only triggers — popover, menu, dialog — carry no text, so give the trigger an `aria-label`. Custom controls take a name from `alt`, `aria-label`, or `aria-labelledby`; the [accessible-name computation](https://www.w3.org/TR/wai-aria-1.2/#namecalculation) spells out how those combine.

## Reduced motion

Enter/exit animations are yours to style, and some people disable motion at the OS level. Author resting styles with no motion and layer transitions on inside `@media (prefers-reduced-motion: no-preference)`. The `[data-starting-style]` / `[data-ending-style]` attributes still apply with no transition, so the element snaps between states and unmounts immediately. See [Animation](/svelte/animation#respect-reduced-motion) for the full pattern.

## Testing

The library is tested, but your composition of it isn't. A checklist before shipping:

- **Keyboard** — Tab to every control; exercise arrow keys, Enter, Space, and Esc in menus, dialogs, listboxes, and tabs.
- **Focus visibility** — Confirm `:focus-visible` styles are visible on every interactive part.
- **Screen readers** — Spot-check critical flows with VoiceOver (macOS/iOS), NVDA, or JAWS.
- **Touch** — Confirm hover-only affordances (tooltips, preview cards) are not the only way to reach essential information.
- **Forms** — Submit with invalid data: errors should land on the right field, and focus should move to the first failure. See [Forms](/svelte/forms#showing-the-error).
- **Reduced motion** — Test with `prefers-reduced-motion: reduce` enabled.
