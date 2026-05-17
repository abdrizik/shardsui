export const FOCUSABLE_ATTRIBUTE = 'data-shards-ui-focusable'

export const FOCUS_GUARD_ATTRIBUTE = 'data-shards-ui-focus-guard'

export const TYPEAHEAD_RESET_MS = 500
export const PATIENT_CLICK_THRESHOLD = 500

export const SHARDSUI_SWIPE_IGNORE_SELECTOR = '[data-shards-ui-swipe-ignore]'

export const SHARDSUI_PORTAL_ATTRIBUTE = 'data-shards-ui-portal'

export const SHARDSUI_PORTAL_SELECTOR = `[${SHARDSUI_PORTAL_ATTRIBUTE}]`

export const CLICK_TRIGGER_SELECTOR = '[data-shards-ui-click-trigger]'

export const SHARDSUI_INERT_ATTRIBUTE = 'data-shards-ui-inert'

export const SHARDSUI_INERT_SELECTOR = `[${SHARDSUI_INERT_ATTRIBUTE}]`

export const DROPDOWN_COLLISION_AVOIDANCE = {
  fallbackAxisSide: 'none'
} as const

export const POPUP_COLLISION_AVOIDANCE = {
  fallbackAxisSide: 'end'
} as const
