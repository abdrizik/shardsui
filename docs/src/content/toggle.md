# Toggle

A pressable on/off button.

:demo{name="toggle/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Toggle } from '@shardsui/svelte/toggle'
</script>

<Toggle />
```

To let several toggles share a selection, wrap them in a [Toggle Group](/svelte/toggle-group).

## API reference

::table{columns="Prop,Type,Default"}

| Prop              | Type                               | Default    | Description                                                                                                                                         |
| :---------------- | :--------------------------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`              | `keyof HTMLElementTagNameMap`      | `'button'` | Element to render. `"button"` uses native button semantics; other tags get `role="button"` and keyboard handlers.                                   |
| `class`           | `string`                           | —          | CSS class applied to the element.                                                                                                                   |
| `style`           | `string`                           | —          | Inline style applied to the element.                                                                                                                |
| `pressed`         | `boolean`                          | `false`    | Pressed state. Pass an initial value for uncontrolled use, or `bind:pressed` to control it. A wrapping `ToggleGroup` owns the state and ignores it. |
| `disabled`        | `boolean`                          | `false`    | Disables interaction. Cascades from a wrapping `ToggleGroup`.                                                                                       |
| `value`           | `string`                           | auto       | The string this toggle contributes to a `ToggleGroup`'s `value`. Defaults to a generated id, so set it explicitly inside a group.                   |
| `onPressedChange` | `(pressed: boolean) => void`       | —          | Fires when the pressed state changes.                                                                                                               |
| `children`        | `Snippet<[{ pressed, disabled }]>` | —          | Toggle content; receives the toggle state.                                                                                                          |

::

| Attribute       | Description                          |
| :-------------- | :----------------------------------- |
| `data-pressed`  | Present when the toggle is pressed.  |
| `data-disabled` | Present when the toggle is disabled. |
