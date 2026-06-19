<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte'
  import MenuRoot from '$lib/components/menu/menu-root.svelte'
  import { MenuContext } from '$lib/components/menu/context'
  import { ContextMenuContext, type ContextMenuRoot } from './context'

  type Props = Omit<
    ComponentProps<typeof MenuRoot>,
    'modal' | 'handle' | 'triggerId' | 'closeParentOnEsc' | 'children'
  > & {
    children?: Snippet
  }

  let { open = $bindable(false), children, ...rest }: Props = $props()

  const contextMenu = $state<ContextMenuRoot>({
    anchor: {
      getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, x: 0, y: 0 })
    },
    initialCursorPoint: null,
    allowMouseUpTrigger: true
  })
  ContextMenuContext.set(contextMenu)
  MenuContext.set(undefined)
</script>

<MenuRoot bind:open {...rest}>
  {@render children?.()}
</MenuRoot>
