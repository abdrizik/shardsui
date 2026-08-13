# Button

An action trigger.

:demo{name="button/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Button } from '@shardsui/svelte/button'
</script>

<Button />
```

## Usage guidelines

- **Submit buttons**: unlike the native button element, `type="submit"` must be specified on Button for it to act as a submit button.
- **Links**: the Button component enforces button semantics (`role="button"`, keyboard interaction, disabled state). It should not be used for links. See [Rendering links as buttons](#examples-rendering-links-as-buttons) below.

## Examples

### Rendering as another tag

Render the button as another tag, such as a `<div>`. Non-button tags get `role="button"` and keyboard handlers automatically.

```svelte title="Custom tag button"
<script>
  import { Button } from '@shardsui/svelte/button'
</script>

<Button as="div">Button that can contain complex children</Button>
```

### Rendering links as buttons

Links (`<a>`) have their own semantics; don't render them as buttons through `as`. To make a link look like a button, style the `<a>` element directly with CSS.

### Loading states

When a button becomes disabled after a click — while it loads — a native `Button` carries the native `disabled` attribute, so the browser drops it from the tab order and blurs it. With `as` set to any other tag it carries `aria-disabled="true"` and `tabindex="-1"` instead. Either way the click, keyboard and pointer handlers stop firing.

:demo{name="button/loading"}

## API reference

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                                                                                       |
| :--------- | :---------------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | Element to render. `"button"` uses native button semantics; other tags get `role="button"` and keyboard handlers. |
| `class`    | `string`                      | —          | CSS class applied to the element.                                                                                 |
| `style`    | `string`                      | —          | Inline style applied to the element.                                                                              |
| `disabled` | `boolean`                     | `false`    | Whether the button should ignore user interaction.                                                                |
| `children` | `Snippet<[{ disabled }]>`     | —          | Content; receives the button's `disabled` state.                                                                  |

::

| Attribute       | Description                          |
| :-------------- | :----------------------------------- |
| `data-disabled` | Present when the button is disabled. |
