# State

Controlled state, direction, disabled, and read-only.

Every component manages its own state by default. Props let you take over when you need to: hold the state yourself, set the reading direction, or take parts out of play. Appearance lives on the [Styling](/svelte/styling) page.

## Uncontrolled by default

A trigger toggles a dialog, a click expands an accordion item — nothing to wire up on your side.

```svelte title="Uncontrolled dialog"
<script>
  import { Dialog } from '@shardsui/svelte/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
</Dialog.Root>
```

The starting state is the initial value of the state prop. Render `<Accordion.Root value={['overview']}>` and that panel opens first; the component takes ownership from there. There's no separate `defaultValue` — the initial value _is_ the default. Pass a literal (or a variable you don't reassign) so the component stays in charge; the moment you want to drive it yourself, switch to one of the two patterns below.

## Taking control with `bind:`

State props — `open`, `value`, `checked` — are `$bindable`, so `bind:` keeps your rune and the component in sync both ways: write it and the component reflects the change, or the component writes it and your variable updates.

Open a dialog after a timeout, with no trigger at all:

```svelte title="Controlled dialog"
<script>
  import { Dialog } from '@shardsui/svelte/dialog'

  let open = $state(false)

  $effect(() => {
    const id = setTimeout(() => (open = true), 1000)
    return () => clearTimeout(id)
  })
</script>

<Dialog.Root bind:open>...</Dialog.Root>
```

Binding also lets you _read_ the component's state anywhere in the parent — gate a save button on `value.length`, mirror `open` into a heading.

## Reacting to changes

Alongside the state prop, each component fires a change handler: `onOpenChange`, `onValueChange`, `onCheckedChange`. These are the component's own events, not native DOM ones — one handler catches every interaction that can move the state, whether that's a pointer, a keypress, an outside click or an escape. Writing to your own bound variable doesn't fire it; the handler reports what the component decided.

Use it to run a side effect when the state moves:

```svelte title="onValueChange"
<script lang="ts">
  import { Accordion } from '@shardsui/svelte/accordion'

  let value = $state<string[]>([])
</script>

<!-- [!code word:onValueChange] -->
<Accordion.Root {value} onValueChange={(next) => (value = next)}>...</Accordion.Root>
```

Pairing the state prop with its handler — `{open} onOpenChange={...}` — is one-way control, an alternative to `bind:` when you'd rather own the write. Nothing changes until your handler updates the variable.

Components with a popup add `onOpenChangeComplete`, which fires once the open or close [animation](/svelte/animation) has finished.

## Vetoing a change

Change handlers are single-argument — the component reports the new state and commits it. To _prevent_ a change (say, keep a dialog open while a confirmation prompt is shown), reach for a Svelte [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings): `bind:open={get, set}`. The `set` runs when the component wants to change the value; if you don't commit it, the `get` keeps returning the old value, so the component stays put.

```svelte title="Keep a dialog open through a close attempt"
<!-- [!code word:hasUnsavedChanges] -->
<script>
  import { Dialog } from '@shardsui/svelte/dialog'

  let open = $state(true)
  let hasUnsavedChanges = $state(true)
</script>

<Dialog.Root
  bind:open={
    () => open,
    (next) => {
      if (!next && hasUnsavedChanges) return // veto: don't commit, dialog stays open
      open = next
    }
  }
>
  ...
</Dialog.Root>
```

The same pattern vetoes any bindable prop — `open`, `value`, `checked` — on any component, since the setter is where you decide whether to accept the new value.

## Reading direction

Every component that navigates with arrow keys or slides content sideways assumes left-to-right. Wrap a subtree — or the whole app — in the Direction Provider to flip that to right-to-left:

```svelte title="RTL subtree"
<script>
  import { DirectionProvider } from '@shardsui/svelte/direction-provider'
</script>

<DirectionProvider direction="rtl">
  <!-- Your app or a group of components -->
</DirectionProvider>
```

It changes component behavior only — which arrow key moves focus, which side a positioner flips to, which way a slider or scrollbar tracks. It never touches the DOM's own text direction, so you still flip the actual text yourself with `dir="rtl"` on an element or `direction: rtl` in CSS.

:demo{name="direction-provider/hero"}

Popups render through a portal, outside your app root and beyond the reach of a surrounding `dir` attribute. To pick up the active direction there, read it with `getDirection()` and apply it where the portal lands. See [Direction Provider](/svelte/direction-provider) for the full API.

## Disabling and read-only

Two ways to take a control out of play, with different intent.

**`disabled`** removes it from the interaction entirely — no pointer, no focus, out of the tab order, and in a form its value isn't submitted. It's on every interactive component, and on individual parts too: disable a single `Accordion.Item` or `Menu.Item` while the rest stay live. Where losing focus would be disorienting — an item inside a [Toolbar](/svelte/toolbar)'s single tab stop, a [Menu](/svelte/menu), [Select](/svelte/select) or [Combobox](/svelte/combobox) item, a [Tabs](/svelte/tabs) tab, an [Accordion](/svelte/accordion), [Collapsible](/svelte/collapsible) or [Navigation Menu](/svelte/navigation-menu) trigger — the part swaps the native `disabled` for `aria-disabled` so it stays reachable.

**`readOnly`** keeps the control focusable and its value visible and submittable, but blocks edits. It says _look, don't change_ — right for a value the user should see in context but can't touch yet. It's on the editable controls: [Checkbox](/svelte/checkbox), [Switch](/svelte/switch), [Radio](/svelte/radio) and Radio Group, [Select](/svelte/select), [Combobox](/svelte/combobox), and [Autocomplete](/svelte/autocomplete).

Both reflect as data attributes on the parts — `[data-disabled]`, `[data-readonly]` — so you can style each state, and both set the right accessibility semantics (a native `disabled`, an `aria-readonly`) so assistive tech announces it.

```css title="switch.css"
.switch[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Per-component behavior props

Beyond the shared props, each component exposes props for the behavior only it has:

- **`loopFocus`** on list components ([Menu](/svelte/menu), [Menubar](/svelte/menubar), [Tabs](/svelte/tabs), [Toolbar](/svelte/toolbar), [Toggle Group](/svelte/toggle-group), [Combobox](/svelte/combobox)) — whether arrow-key navigation wraps from the last item back to the first. On by default.
- **`orientation`** — `'horizontal'` or `'vertical'`; decides which arrow keys move focus, and reflects as `data-orientation` on the parts whose layout depends on it.
- **`modal`** on overlays — whether opening uses a **focus trap** and blocks the page behind it.
- **`openOnHover`** on a [Menu](/svelte/menu) or [Popover](/svelte/popover) trigger — open on pointer hover instead of click (submenu triggers hover-open by default). **`delay`** and **`closeDelay`** on the same trigger set how long the pointer must rest before it opens and how long it lingers after the pointer leaves. A [Tooltip](/svelte/tooltip) is hover-driven by nature: its **`delay`** sits on `Tooltip.Trigger`, and `Tooltip.Provider` supplies a shared one for a group.

The complete set for each component lives in its API reference. Check there before writing your own keyboard or focus logic.
