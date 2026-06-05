<script lang="ts">
  import type { DialogRoot } from '$lib/components/dialog/dialog.svelte'
  import type { Snippet } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { DrawerProviderContext, type DrawerVisual } from './context'

  type Props = {
    children?: Snippet
  }

  let { children }: Props = $props()

  const openDrawers = new SvelteSet<DialogRoot>()

  function setDrawerOpen(drawer: DialogRoot, open: boolean) {
    if (open) openDrawers.add(drawer)
    else openDrawers.delete(drawer)
  }

  const active = $derived(openDrawers.size > 0)

  const visualState = $state<DrawerVisual>({ swipeProgress: 0, frontmostHeight: 0 })

  function setVisualState(next: DrawerVisual) {
    visualState.swipeProgress = Number.isFinite(next.swipeProgress) ? next.swipeProgress : 0
    visualState.frontmostHeight = Number.isFinite(next.frontmostHeight) ? next.frontmostHeight : 0
  }

  DrawerProviderContext.set({
    get active() {
      return active
    },
    setDrawerOpen,
    visualState,
    setVisualState
  })
</script>

{@render children?.()}
