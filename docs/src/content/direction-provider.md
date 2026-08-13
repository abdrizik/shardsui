# Direction Provider

Sets LTR or RTL direction.

:demo{name="direction-provider/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { DirectionProvider } from '@shardsui/svelte/direction-provider'
</script>

<DirectionProvider>
  <!-- Your app or a group of components -->
</DirectionProvider>
```

With `direction="rtl"`, the ShardsUI components inside lay out and navigate for right-to-left reading. The provider changes component behavior only — it never touches the DOM's own direction, so flip the text yourself with `dir="rtl"` on an element or `direction: rtl` in CSS.

## API reference

### DirectionProvider

Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop        | Type            | Default | Description                        |
| :---------- | :-------------- | :------ | :--------------------------------- |
| `direction` | `TextDirection` | `'ltr'` | The reading direction of the text. |
| `children`  | `Snippet`       | —       | Content.                           |

::

### getDirection

Read the current text direction. Useful for portaled content, which renders outside your app root and so escapes a surrounding `dir` attribute.

```svelte title="Portaled popup direction"
<script>
  import { getDirection } from '@shardsui/svelte/direction-provider'
</script>

<Popover.Portal>
  <Popover.Positioner>
    <Popover.Popup dir={getDirection()}>...</Popover.Popup>
  </Popover.Positioner>
</Popover.Portal>
```

Call it from a template expression or inside `$derived` so it stays live. A bare `const direction = getDirection()` in `<script>` runs once and keeps whatever direction was active at initialization.

```svelte title="Reading the direction reactively"
<script>
  import { getDirection } from '@shardsui/svelte/direction-provider'

  const direction = $derived(getDirection())
</script>
```

**Return value**

```ts
type ReturnValue = TextDirection
```

## Additional types

### TextDirection

```ts
type TextDirection = 'ltr' | 'rtl'
```
