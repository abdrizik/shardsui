import { Context } from '$lib/internal/context'
import type {
  Align,
  AnchorPositioning,
  Side
} from '$lib/internal/floating/anchor-positioning.svelte'
import type { SwipeDirection } from '$lib/internal/swipe-dismiss.svelte'
import type { ToastProvider, ToastRoot } from './toast.svelte'
import type { ToastObject } from './types'

export type ToastRootState = {
  transitionStatus: ToastObject['transitionStatus']
  expanded: boolean
  limited: boolean
  type: string | undefined
  swiping: boolean
  swipeDirection: SwipeDirection | undefined
}

export type ToastContentState = {
  expanded: boolean
  behind: boolean
}

export type ToastViewportState = {
  expanded: boolean
}

export type ToastTitleState = {
  type: string | undefined
}

export type ToastDescriptionState = {
  type: string | undefined
}

export type ToastCloseState = {
  type: string | undefined
}

export type ToastActionState = {
  type: string | undefined
}

export type ToastPositionerState = {
  side: Side
  align: Align
  anchorHidden: boolean
}

export type ToastArrowState = {
  side: Side
  align: Align
  uncentered: boolean
}

export const ToastProviderContext = new Context<ToastProvider>('Toast.Provider')

export const ToastContext = new Context<ToastRoot>('Toast.Root')

export const ToastPositionerContext = new Context<AnchorPositioning>('Toast.Positioner')
