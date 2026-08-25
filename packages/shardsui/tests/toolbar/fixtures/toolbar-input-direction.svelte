<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { Toolbar } from '$lib/components/toolbar'

  let { direction = 'ltr' }: { direction?: TextDirection } = $props()
</script>

<DirectionProvider {direction}>
  <Toolbar.Root orientation="horizontal" dir={direction}>
    <Toolbar.Button data-testid="before">Before</Toolbar.Button>
    <Toolbar.Input value="abcd" data-testid="input" />
    <Toolbar.Button data-testid="after">After</Toolbar.Button>
  </Toolbar.Root>
</DirectionProvider>
