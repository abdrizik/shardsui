<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { Transition } from '$lib/internal/transition-status.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { untrack } from 'svelte'
  import { AvatarContext, type ImageLoadingStatus } from './context'

  type Props = Omit<PartProps<[], 'img'>, 'children'> & {
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void
  }

  let { as = 'img', ref = $bindable(null), onLoadingStatusChange, ...rest }: Props = $props()

  const avatar = AvatarContext.get()

  let loadingStatus = $state<ImageLoadingStatus>('idle')

  const isLoaded = $derived(loadingStatus === 'loaded')

  const src = $derived(rest.src)
  const srcset = $derived(rest.srcset)
  const sizes = $derived(rest.sizes)
  const crossorigin = $derived(rest.crossorigin)
  const referrerpolicy = $derived(rest.referrerpolicy)

  $effect.pre(() => {
    if (!src && !srcset) {
      loadingStatus = 'error'
      return
    }

    const image = new Image()
    let active = true

    loadingStatus = 'loading'
    image.onload = () => {
      if (active) loadingStatus = 'loaded'
    }
    image.onerror = () => {
      if (active) loadingStatus = 'error'
    }
    if (referrerpolicy) image.referrerPolicy = referrerpolicy
    image.crossOrigin = crossorigin ?? null
    if (sizes) image.sizes = sizes
    if (srcset) image.srcset = srcset
    if (src) image.src = src

    if (image.complete) {
      loadingStatus = image.naturalWidth > 0 ? 'loaded' : 'error'
    }

    return () => (active = false)
  })

  $effect.pre(() => {
    const status = loadingStatus
    if (status === 'idle') return
    untrack(() => {
      onLoadingStatusChange?.(status)
      avatar.imageLoadingStatus = status
    })
  })

  $effect.pre(() => {
    return () => (avatar.imageLoadingStatus = 'idle')
  })

  const transition = new Transition(() => ({ open: isLoaded }))

  openChangeComplete(() => ({
    open: isLoaded,
    element: ref,
    onComplete: () => {
      if (!isLoaded) transition.mounted = false
    }
  }))

  const stateAttrs = $derived(
    dataAttrs({
      'starting-style': transition.status === 'starting',
      'ending-style': transition.status === 'ending'
    })
  )
</script>

{#if transition.mounted}
  <svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest} />
{/if}
