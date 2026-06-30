<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let { open = false }: { open?: boolean } = $props()
</script>

<Drawer.Provider>
  <Drawer.IndentBackground data-testid="bg" />
  <Drawer.Root {open}>
    <Drawer.Trigger>Open</Drawer.Trigger>
  </Drawer.Root>
</Drawer.Provider>
