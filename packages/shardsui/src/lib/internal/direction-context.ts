import { Context } from '$lib/internal/context'

export type TextDirection = 'ltr' | 'rtl'

export type DirectionContextValue = {
  direction: TextDirection
}

export const DirectionContext = new Context<DirectionContextValue>('DirectionProvider', {
  direction: 'ltr'
})

export function getDirection(): TextDirection {
  return DirectionContext.get().direction
}
