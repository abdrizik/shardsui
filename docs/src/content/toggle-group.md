# Toggle Group

Toggle buttons sharing a selection.

:demo{name="toggle-group/hero"}

## Anatomy

A Toggle Group wraps a set of [Toggle](/svelte/toggle) parts:

```svelte title="Anatomy"
<script>
  import { Toggle } from '@shardsui/svelte/toggle'
  import { ToggleGroup } from '@shardsui/svelte/toggle-group'
</script>

<ToggleGroup>
  <Toggle value="bold" />
</ToggleGroup>
```

Give every toggle a `value` — those strings are what the group's `value` array holds.

## Examples

### Multiple

Set the `multiple` prop to let more than one toggle stay pressed at once.

:demo{name="toggle-group/multiple"}

### Inside a toolbar

A group nested in a [Toolbar](/svelte/toolbar) joins the toolbar's arrow-key navigation and its single tab stop. The toolbar's `orientation` and `loopFocus` apply instead of the group's, and `Home` / `End` no longer move focus. `Toolbar.Root` / `Toolbar.Group` also cascade their `disabled` down to the toggles.

```svelte title="Toggle Group in a toolbar"
<Toolbar.Root>
  <ToggleGroup value={['bold']}>
    <Toggle value="bold">Bold</Toggle>
    <Toggle value="italic">Italic</Toggle>
  </ToggleGroup>
  <Toolbar.Separator />
  <Toolbar.Button>Clear</Toolbar.Button>
</Toolbar.Root>
```

## API reference

::table{columns="Prop,Type,Default"}

| Prop            | Type                                             | Default        | Description                                                                                               |
| :-------------- | :----------------------------------------------- | :------------- | :-------------------------------------------------------------------------------------------------------- |
| `as`            | `keyof HTMLElementTagNameMap`                    | `'div'`        | HTML element to render.                                                                                   |
| `class`         | `string`                                         | —              | CSS class applied to the element.                                                                         |
| `style`         | `string`                                         | —              | Inline style applied to the element.                                                                      |
| `value`         | `readonly string[]`                              | —              | Values of the pressed toggles. Pass an initial array for uncontrolled use, or `bind:value` to control it. |
| `disabled`      | `boolean`                                        | `false`        | Disables every toggle in the group. Cascades from `Toolbar.Root` / `Toolbar.Group` when wrapped.          |
| `multiple`      | `boolean`                                        | `false`        | Lets several toggles be pressed at once. When `false`, pressing one unpresses the rest.                   |
| `orientation`   | `'horizontal' \| 'vertical'`                     | `'horizontal'` | Which arrow keys move focus between toggles. A wrapping `Toolbar` owns navigation and overrides it.       |
| `loopFocus`     | `boolean`                                        | `true`         | Whether arrow-key focus wraps from the last toggle back to the first. A wrapping `Toolbar` overrides it.  |
| `onValueChange` | `(value: string[]) => void`                      | —              | Fires when the value changes.                                                                             |
| `children`      | `Snippet<[{ disabled, multiple, orientation }]>` | —              | Group content; receives the group's `disabled`, `multiple` and `orientation` state.                       |

::

| Attribute          | Description                                    |
| :----------------- | :--------------------------------------------- |
| `data-disabled`    | Present when the group is disabled.            |
| `data-orientation` | Indicates the orientation of the toggle group. |
| `data-multiple`    | Present when `multiple` is set.                |

**Keyboard:**

The group is one tab stop: `Tab` moves into it and out again, and disabled toggles are skipped.

| Key                        | Action                                                  |
| :------------------------- | :------------------------------------------------------ |
| `ArrowRight` / `ArrowLeft` | Next / previous toggle when horizontal. Swapped in RTL. |
| `ArrowDown` / `ArrowUp`    | Next / previous toggle when vertical.                   |
| `Home` / `End`             | First / last toggle.                                    |
