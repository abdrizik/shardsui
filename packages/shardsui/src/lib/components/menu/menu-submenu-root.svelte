<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte'
  import { MenuSubmenuContext } from './context'
  import MenuRoot from './menu-root.svelte'

  type Props = Omit<
    ComponentProps<typeof MenuRoot>,
    'modal' | 'handle' | 'triggerId' | 'children'
  > & {
    children?: Snippet
  }

  let { open = $bindable(false), children, ...rest }: Props = $props()

  MenuSubmenuContext.set(true)
</script>

<MenuRoot bind:open {...rest}>
  {@render children?.()}
</MenuRoot>
