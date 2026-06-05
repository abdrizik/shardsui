<script lang="ts">
  import { DialogContext, type DialogViewportState } from '$lib/components/dialog/context'
  import DialogViewport from '$lib/components/dialog/dialog-viewport.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { DrawerProviderContext, DrawerContext, DrawerViewportContext } from './context'
  import { DrawerSwipe } from './swipe.svelte'

  type Props = PartProps<[DialogViewportState]>

  let { as, ref = $bindable(null), children, ...rest }: Props = $props()

  const drawer = DrawerContext.get()
  const dialog = DialogContext.get()
  const provider = DrawerProviderContext.getOr()

  const swipe = new DrawerSwipe(dialog, drawer, provider)

  DrawerViewportContext.set(swipe)
</script>

<DialogViewport
  {as}
  bind:ref
  {@attach swipe.attach}
  {...rest}
  data-nested-dialog-open={undefined}
  {children}
/>
