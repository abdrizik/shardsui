# Toolbar

A row of grouped controls.

:demo{name="toolbar/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Toolbar } from '@shardsui/svelte/toolbar'
</script>

<Toolbar.Root>
  <Toolbar.Button />
  <Toolbar.Link />
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toolbar.Button />
    <Toolbar.Button />
  </Toolbar.Group>
  <Toolbar.Input />
</Toolbar.Root>
```

## Usage guidelines

- **Name the toolbar and its groups**: `Toolbar.Root` renders `role="toolbar"` and `Toolbar.Group` renders `role="group"`, so give each an `aria-label` or `aria-labelledby`. Icon-only buttons need an `aria-label` of their own.
- **Use inputs sparingly**: in a horizontal toolbar, left and right arrows both move the text cursor inside an input and step between the surrounding controls. To avoid that conflict, include at most one input and place it last.

## Examples

### Using with Select

Mount `<Select.Root>` inside the toolbar and let its own trigger be the control. `<Select.Trigger>` detects the surrounding toolbar and registers itself as a toolbar item, so it joins the arrow-key navigation and shares the toolbar's single tab stop. [Toggle Group](/svelte/toggle-group) integrates the same way, and its toggles become the toolbar's items.

```svelte title="Using Select with toolbar"
<Toolbar.Root>
  <Toolbar.Button>Bold</Toolbar.Button>
  <Toolbar.Separator />
  <Select.Root>
    <!-- [!code highlight] -->
    <Select.Trigger>
      <Select.Value />
    </Select.Trigger>
    <!-- Compose the rest of the select -->
  </Select.Root>
</Toolbar.Root>
```

### Using an input

`Toolbar.Input` joins the toolbar's single tab stop. Arrow-key focus selects the whole value, and an arrow key steps on to the next control only once the cursor sits collapsed at the matching edge of the text:

```svelte title="Using an input with toolbar"
<Toolbar.Root>
  <Toolbar.Button>Bold</Toolbar.Button>
  <!-- [!code highlight] -->
  <Toolbar.Input placeholder="Search" />
</Toolbar.Root>
```

### Disabled items

`Toolbar.Root` and `Toolbar.Group` cascade `disabled` to the buttons and inputs inside them; links are never disabled. A disabled item keeps its place in the arrow-key sequence and carries `aria-disabled` instead of the native `disabled` attribute, so screen reader users still meet it:

```svelte title="Disabled toolbar items"
<Toolbar.Root disabled>
  <Toolbar.Button>Bold</Toolbar.Button>
  <Toolbar.Button>Italic</Toolbar.Button>
</Toolbar.Root>
```

## API reference

### Root

A container for grouping a set of controls, such as buttons, toggle groups, or menus.
Renders a `<div>` element with `role="toolbar"`.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                   | Default        | Description                                                                         |
| :------------ | :------------------------------------- | :------------- | :---------------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`          | `'div'`        | HTML element to render.                                                             |
| `class`       | `string`                               | —              | CSS class applied to the element.                                                   |
| `style`       | `string`                               | —              | Inline style applied to the element.                                                |
| `loopFocus`   | `boolean`                              | `true`         | Whether arrow-key focus wraps from the last item back to the first, and back again. |
| `disabled`    | `boolean`                              | `false`        | Disables every button, input and group in the toolbar. Links are unaffected.        |
| `orientation` | `'horizontal' \| 'vertical'`           | `'horizontal'` | Which arrow keys move focus between items. Also sets `aria-orientation`.            |
| `children`    | `Snippet<[{ disabled, orientation }]>` | —              | Toolbar content; receives the toolbar's `disabled` and `orientation` state.         |

::

| Attribute          | Description                               |
| :----------------- | :---------------------------------------- |
| `data-disabled`    | Present when the toolbar is disabled.     |
| `data-orientation` | Indicates the orientation of the toolbar. |

**Keyboard:**

The toolbar is one tab stop: `Tab` enters it at the item focused last — the first item to begin with — and leaves it altogether. `Home` and `End` are left to the focused control.

| Key                        | Action                                                |
| :------------------------- | :---------------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Next / previous item when horizontal. Swapped in RTL. |
| `ArrowDown` / `ArrowUp`    | Next / previous item when vertical.                   |

### Button

A button that can be used as-is or as a trigger for other components.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                   | Default    | Description                                                                 |
| :--------- | :------------------------------------- | :--------- | :-------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`          | `'button'` | HTML element to render.                                                     |
| `class`    | `string`                               | —          | CSS class applied to the element.                                           |
| `style`    | `string`                               | —          | Inline style applied to the element.                                        |
| `disabled` | `boolean`                              | `false`    | Disables the button. Also cascades from `Toolbar.Root` and `Toolbar.Group`. |
| `children` | `Snippet<[{ disabled, orientation }]>` | —          | Button content; receives the button's `disabled` and `orientation` state.   |

::

| Attribute          | Description                               |
| :----------------- | :---------------------------------------- |
| `data-disabled`    | Present when the button is disabled.      |
| `data-orientation` | Indicates the orientation of the toolbar. |

### Link

A link that joins the toolbar's arrow-key navigation.
Renders an `<a>` element. Toolbar and group `disabled` never reach it.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'a'`   | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `href`     | `string`                      | —       | URL the link points to.              |
| `children` | `Snippet<[{ orientation }]>`  | —       | Content; receives the link state.    |

::

| Attribute          | Description                               |
| :----------------- | :---------------------------------------- |
| `data-orientation` | Indicates the orientation of the toolbar. |

### Input

A native input that takes part in the toolbar's keyboard navigation.
Renders an `<input>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                           | Default | Description                                                                                                                                                             |
| :--------- | :----------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `class`    | `string`                       | —       | CSS class applied to the element.                                                                                                                                       |
| `style`    | `string`                       | —       | Inline style applied to the element.                                                                                                                                    |
| `value`    | `string \| number \| string[]` | —       | Initial value, forwarded to the native `value` attribute. The input owns its value after that.                                                                          |
| `disabled` | `boolean`                      | `false` | Disables the input: `aria-disabled` is set and clicks are blocked, but the native `disabled` attribute never is. Also cascades from `Toolbar.Root` and `Toolbar.Group`. |

::

| Attribute          | Description                               |
| :----------------- | :---------------------------------------- |
| `data-disabled`    | Present when the input is disabled.       |
| `data-orientation` | Indicates the orientation of the toolbar. |

### Group

Groups several toolbar items or toggles.
Renders a `<div>` element with `role="group"`.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                   | Default | Description                                                             |
| :--------- | :------------------------------------- | :------ | :---------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`          | `'div'` | HTML element to render.                                                 |
| `class`    | `string`                               | —       | CSS class applied to the element.                                       |
| `style`    | `string`                               | —       | Inline style applied to the element.                                    |
| `disabled` | `boolean`                              | `false` | Disables every button and input in the group.                           |
| `children` | `Snippet<[{ disabled, orientation }]>` | —       | Group content; receives the group's `disabled` and `orientation` state. |

::

| Attribute          | Description                               |
| :----------------- | :---------------------------------------- |
| `data-disabled`    | Present when the group is disabled.       |
| `data-orientation` | Indicates the orientation of the toolbar. |

### Separator

A [Separator](/svelte/separator) oriented perpendicular to the toolbar.
Renders a `<div>` element with `role="separator"`.

::table{columns="Prop,Type,Default"}

| Prop          | Type                          | Default | Description                                                                   |
| :------------ | :---------------------------- | :------ | :---------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                                       |
| `class`       | `string`                      | —       | CSS class applied to the element.                                             |
| `style`       | `string`                      | —       | Inline style applied to the element.                                          |
| `orientation` | `'horizontal' \| 'vertical'`  | —       | Overrides the orientation, which is otherwise perpendicular to the toolbar's. |

::

| Attribute          | Description                                                                        |
| :----------------- | :--------------------------------------------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator, which is perpendicular to the toolbar. |
