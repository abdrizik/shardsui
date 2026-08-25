# Changelog

## 0.1.0-beta.1

- Guard DOM containment against event targets that are not elements. A `Window` target on a focus
  or pointer event previously reached `Node.prototype.contains`, which throws — affecting dialog
  outside-press and drawer and toast swipe gestures.
- Treat `input` events as typed input only when they are real `InputEvent`s.
- Add oxlint alongside oxfmt and remove redundant type assertions across the library.

## 0.1.0-beta.0

- Initial beta release.
