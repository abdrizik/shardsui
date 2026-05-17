export const REASONS = {
  none: 'none',
  triggerPress: 'trigger-press',
  triggerHover: 'trigger-hover',
  triggerFocus: 'trigger-focus',
  outsidePress: 'outside-press',
  itemPress: 'item-press',
  closePress: 'close-press',
  clearPress: 'clear-press',
  linkPress: 'link-press',
  inputChange: 'input-change',
  inputClear: 'input-clear',
  inputPress: 'input-press',
  focusOut: 'focus-out',
  escapeKey: 'escape-key',
  closeWatcher: 'close-watcher',
  swipe: 'swipe',
  listNavigation: 'list-navigation',
  cancelOpen: 'cancel-open',
  siblingOpen: 'sibling-open',
  disabled: 'disabled',
  imperativeAction: 'imperative-action'
} as const

export type ChangeEventReason = (typeof REASONS)[keyof typeof REASONS]
