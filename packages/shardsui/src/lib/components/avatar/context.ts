import { Context } from '$lib/internal/context'

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export type AvatarRootState = {
  imageLoadingStatus: ImageLoadingStatus
}

export const AvatarContext = new Context<AvatarRootState>('Avatar.Root')
