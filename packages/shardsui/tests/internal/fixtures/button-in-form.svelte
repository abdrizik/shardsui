<script lang="ts">
  import ButtonFixture from './button-fixture.svelte'

  type Props = {
    type: 'submit' | 'reset'
    onsubmit?: (event: SubmitEvent) => void
    onreset?: (event: Event) => void
  }

  let { type, onsubmit, onreset }: Props = $props()
</script>

<form {onsubmit} {onreset}>
  <ButtonFixture as="button" composite {type} />
</form>
