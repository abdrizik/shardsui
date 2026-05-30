import type { AnchorPositioningProps } from '$lib/internal/floating/anchor-positioning.svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

export type ToastManagerPositionerProps = AnchorPositioningProps & {
  anchor?: Element | null
}

export type ToastObject<Data extends object = object> = {
  id: string
  element?: HTMLElement | null
  title?: string
  type?: string
  description?: string
  timeout?: number
  priority?: 'low' | 'high'
  transitionStatus?: 'starting' | 'ending'
  updateKey?: number
  limited?: boolean
  height?: number
  onClose?: () => void
  positionerProps?: ToastManagerPositionerProps
  onRemove?: () => void
  actionProps?: Omit<HTMLButtonAttributes, 'children'> & {
    children?: string
  }
  data?: Data
}

export type StoredToast<Data extends object = object> = ToastObject<Data> & { updateKey: number }

export type ToastManagerAddOptions<Data extends object = object> = Omit<
  ToastObject<Data>,
  'id' | 'height' | 'element' | 'limited' | 'updateKey'
> & {
  id?: string
}

export type ToastManagerUpdateOptions<Data extends object = object> = Partial<
  Omit<
    ToastObject<Data>,
    'id' | 'element' | 'height' | 'transitionStatus' | 'limited' | 'updateKey'
  >
>

export type ToastManagerPromiseOptions<Value, Data extends object = object> = {
  loading: string | ToastManagerUpdateOptions<Data>
  success:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((result: Value) => string | ToastManagerUpdateOptions<Data>)
  error:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((error: unknown) => string | ToastManagerUpdateOptions<Data>)
}
