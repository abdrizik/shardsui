<script lang="ts">
  import { Field } from '$lib/components/field'

  let { onElement }: { onElement: (element: HTMLInputElement) => void } = $props()
  let el = $state<HTMLInputElement | null>(null)
  $effect(() => {
    if (el) onElement(el)
  })
</script>

<Field.Root>
  <Field.Control bind:ref={el} value="foo" data-testid="input" />
</Field.Root>
