# Scroll Area

A styleable scroll region.

:demo{name="scroll-area/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { ScrollArea } from '@shardsui/svelte/scroll-area'
</script>

<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content />
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

## Examples

### Both scrollbars

When both scrollbars are visible, add `<ScrollArea.Corner>` to fill the gap where they meet so they never overlap.

:demo{name="scroll-area/both"}

### Gradient scroll fade

Feed the viewport's overflow CSS variables into a `mask-image` to fade content near the edges. The fade deepens the further the user scrolls away from each edge.

```css title="scroll-area.css"
.viewport {
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black min(40px, var(--scroll-area-overflow-y-start)),
    black calc(100% - min(40px, var(--scroll-area-overflow-y-end, 40px))),
    transparent 100%
  );
  mask-repeat: no-repeat;
}
```

The variables are written on `<ScrollArea.Viewport>` and inherit from there, so the viewport itself or any element inside it can read them.

They are only set once the scroll area has measured itself after mount. Until then a `var()` without a fallback makes the whole `mask-image` invalid and nothing is masked, so give each call a fallback if the fade has to render on the first paint.

```css title="Fallbacks before the first measurement"
/* [!code word:, 0px] */
/* [!code word:, 40px] */
var(--scroll-area-overflow-y-start, 0px);
var(--scroll-area-overflow-y-end, 40px);
```

:demo{name="scroll-area/scroll-fade"}

### Combining with Tabs

When a tab list overflows, wrap `<Tabs.List>` in a `<ScrollArea.Viewport>` so the list scrolls horizontally inside the scroll area, and add the scrollbar parts alongside it.

```svelte title="Tabs with ScrollArea"
<Tabs.Root value="overview">
  <ScrollArea.Root>
    <!-- [!code highlight] -->
    <ScrollArea.Viewport>
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="horizontal">
      <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
  <Tabs.Panel value="overview">...</Tabs.Panel>
</Tabs.Root>
```

Because the overflow variables inherit, the tab list can drive its own [mask fade](#examples-gradient-scroll-fade) from `--scroll-area-overflow-x-start` and `--scroll-area-overflow-x-end`.

## API reference

### Root

Groups all parts of the scroll area.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                                                                             | Default | Description                                                                                                          |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                                                                                    | `'div'` | HTML element to render.                                                                                              |
| `class`                 | `string`                                                                                                                         | —       | CSS class applied to the element.                                                                                    |
| `style`                 | `string`                                                                                                                         | —       | Inline style applied to the element, after the built-in `position` and corner variables.                             |
| `overflowEdgeThreshold` | `number \| { xStart?: number; xEnd?: number; yStart?: number; yEnd?: number }`                                                   | `0`     | Pixels an edge must be scrolled past before its `data-overflow-*` attribute appears. One number sets all four edges. |
| `children`              | `Snippet<[{ scrolling, hasOverflowX, hasOverflowY, overflowXStart, overflowXEnd, overflowYStart, overflowYEnd, cornerHidden }]>` | —       | Content; receives the scroll area's scrolling and overflow state.                                                    |

::

| Attribute               | Description                                                    |
| :---------------------- | :------------------------------------------------------------- |
| `data-scrolling`        | Present while the user is scrolling the viewport.              |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.           |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.          |
| `data-overflow-x-start` | Present when content is hidden past the horizontal start edge. |
| `data-overflow-x-end`   | Present when content is hidden past the horizontal end edge.   |
| `data-overflow-y-start` | Present when content is hidden past the vertical start edge.   |
| `data-overflow-y-end`   | Present when content is hidden past the vertical end edge.     |

| CSS Variable                  | Description                                                                 |
| :---------------------------- | :-------------------------------------------------------------------------- |
| `--scroll-area-corner-width`  | Width of the gap where the scrollbars meet; `0px` unless both are visible.  |
| `--scroll-area-corner-height` | Height of the gap where the scrollbars meet; `0px` unless both are visible. |

### Viewport

The element that scrolls. Hides the browser's scrollbars and carries the overflow CSS variables.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                             | Default | Description                                                       |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------- | :------ | :---------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                    | `'div'` | HTML element to render.                                           |
| `class`    | `string`                                                                                                                         | —       | CSS class applied to the element.                                 |
| `style`    | `string`                                                                                                                         | —       | Inline style applied before the built-in `overflow`.              |
| `children` | `Snippet<[{ scrolling, hasOverflowX, hasOverflowY, overflowXStart, overflowXEnd, overflowYStart, overflowYEnd, cornerHidden }]>` | —       | Content; receives the scroll area's scrolling and overflow state. |

::

| Attribute               | Description                                                    |
| :---------------------- | :------------------------------------------------------------- |
| `data-scrolling`        | Present while the user is scrolling the viewport.              |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.           |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.          |
| `data-overflow-x-start` | Present when content is hidden past the horizontal start edge. |
| `data-overflow-x-end`   | Present when content is hidden past the horizontal end edge.   |
| `data-overflow-y-start` | Present when content is hidden past the vertical start edge.   |
| `data-overflow-y-end`   | Present when content is hidden past the vertical end edge.     |

| CSS Variable                     | Description                                                  |
| :------------------------------- | :----------------------------------------------------------- |
| `--scroll-area-overflow-x-start` | Distance scrolled from the horizontal start edge, in pixels. |
| `--scroll-area-overflow-x-end`   | Distance remaining to the horizontal end edge, in pixels.    |
| `--scroll-area-overflow-y-start` | Distance scrolled from the vertical start edge, in pixels.   |
| `--scroll-area-overflow-y-end`   | Distance remaining to the vertical end edge, in pixels.      |

### Content

A container for the content of the scroll area. Sized to fit its children so horizontal overflow measures correctly.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                             | Default | Description                                                          |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                    | `'div'` | HTML element to render.                                              |
| `class`    | `string`                                                                                                                         | —       | CSS class applied to the element.                                    |
| `style`    | `string`                                                                                                                         | —       | Inline style applied to the element, after the built-in `min-width`. |
| `children` | `Snippet<[{ scrolling, hasOverflowX, hasOverflowY, overflowXStart, overflowXEnd, overflowYStart, overflowYEnd, cornerHidden }]>` | —       | Content; receives the scroll area's scrolling and overflow state.    |

::

| Attribute               | Description                                                    |
| :---------------------- | :------------------------------------------------------------- |
| `data-scrolling`        | Present while the user is scrolling the viewport.              |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.           |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.          |
| `data-overflow-x-start` | Present when content is hidden past the horizontal start edge. |
| `data-overflow-x-end`   | Present when content is hidden past the horizontal end edge.   |
| `data-overflow-y-start` | Present when content is hidden past the vertical start edge.   |
| `data-overflow-y-end`   | Present when content is hidden past the vertical end edge.     |

### Scrollbar

A vertical or horizontal scrollbar for the scroll area. Rendered only while its axis overflows, unless `keepMounted` is set. Clicking the track jumps to that position; dragging the thumb scrolls.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                                                                                                                    | Default      | Description                                                                                       |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------- | :------------------------------------------------------------------------------------------------ |
| `as`          | `keyof HTMLElementTagNameMap`                                                                                                                           | `'div'`      | HTML element to render.                                                                           |
| `class`       | `string`                                                                                                                                                | —            | CSS class applied to the element.                                                                 |
| `style`       | `string`                                                                                                                                                | —            | Inline style applied to the element, after the built-in positioning.                              |
| `orientation` | `'horizontal' \| 'vertical'`                                                                                                                            | `'vertical'` | Whether the scrollbar controls vertical or horizontal scroll.                                     |
| `keepMounted` | `boolean`                                                                                                                                               | `false`      | Keep the scrollbar in the DOM when its axis doesn't overflow; hide it with `data-has-overflow-*`. |
| `children`    | `Snippet<[{ hovering, scrolling, orientation, hasOverflowX, hasOverflowY, overflowXStart, overflowXEnd, overflowYStart, overflowYEnd, cornerHidden }]>` | —            | Content; receives the scrollbar's hover, scrolling, orientation and overflow state.               |

::

| Attribute               | Description                                                                |
| :---------------------- | :------------------------------------------------------------------------- |
| `data-orientation`      | Indicates the orientation of the scrollbar.                                |
| `data-hovering`         | Present while a mouse or pen is over the scroll area; touch never sets it. |
| `data-scrolling`        | Present while the user scrolls along this scrollbar's axis.                |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.                       |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.                      |
| `data-overflow-x-start` | Present when content is hidden past the horizontal start edge.             |
| `data-overflow-x-end`   | Present when content is hidden past the horizontal end edge.               |
| `data-overflow-y-start` | Present when content is hidden past the vertical start edge.               |
| `data-overflow-y-end`   | Present when content is hidden past the vertical end edge.                 |

| CSS Variable                 | Description                                       |
| :--------------------------- | :------------------------------------------------ |
| `--scroll-area-thumb-height` | The thumb's height; set on a vertical scrollbar.  |
| `--scroll-area-thumb-width`  | The thumb's width; set on a horizontal scrollbar. |

### Thumb

The draggable part of the scrollbar that indicates the current scroll position. Sized from the scrollbar's thumb CSS variable, so it needs a cross-axis size of its own.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                    | Default | Description                                                                           |
| :--------- | :-------------------------------------- | :------ | :------------------------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`           | `'div'` | HTML element to render.                                                               |
| `class`    | `string`                                | —       | CSS class applied to the element.                                                     |
| `style`    | `string`                                | —       | Inline style applied to the element, before the built-in `visibility` and thumb size. |
| `children` | `Snippet<[{ scrolling, orientation }]>` | —       | Content; receives the thumb's scrolling and orientation state.                        |

::

| Attribute          | Description                                                 |
| :----------------- | :---------------------------------------------------------- |
| `data-orientation` | Indicates the orientation of the scrollbar.                 |
| `data-scrolling`   | Present while the user scrolls along this scrollbar's axis. |

### Corner

Fills the gap where the horizontal and vertical scrollbars meet. Rendered only while both are visible.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `children` | `Snippet`                     | —       | Content.                             |

::
