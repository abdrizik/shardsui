<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let {
    firstOpen = false,
    secondOpen = false,
    showSecond = true
  }: { firstOpen?: boolean; secondOpen?: boolean; showSecond?: boolean } = $props()
</script>

<Drawer.Provider>
  <Drawer.IndentBackground data-testid="background" />
  <Drawer.Root open={firstOpen}>First drawer</Drawer.Root>
  {#if showSecond}
    <Drawer.Root open={secondOpen}>Second drawer</Drawer.Root>
  {/if}
</Drawer.Provider>
