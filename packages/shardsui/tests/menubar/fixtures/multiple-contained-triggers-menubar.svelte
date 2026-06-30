<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Menubar } from '$lib/components/menubar'
  import DynamicMenu from './dynamic-menu.svelte'
  import { menuContents } from './menu-contents'

  let {
    disabled = false,
    loopFocus = true,
    orientation = 'horizontal',
    outside = false
  }: {
    disabled?: boolean
    loopFocus?: boolean
    orientation?: 'horizontal' | 'vertical'
    outside?: boolean
  } = $props()
</script>

<div>
  <Menubar data-testid="menubar-root" style="display: flex" {disabled} {loopFocus} {orientation}>
    <DynamicMenu>
      {#snippet triggers()}
        {#each Object.entries(menuContents) as [key, menuDef] (key)}
          <Menu.Trigger payload={menuDef} data-testid={menuDef.triggerTestId}>
            {menuDef.label}
          </Menu.Trigger>
        {/each}
      {/snippet}
    </DynamicMenu>
  </Menubar>
  {#if outside}
    <button data-testid="outside">Outside</button>
  {/if}
</div>
