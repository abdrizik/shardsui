<script lang="ts">
  import DismissModalLayer from './dismiss-modal-layer.svelte'

  type Props = {
    outerModal?: boolean | null
    innerModal?: boolean | null
  }

  let { outerModal = true, innerModal = null }: Props = $props()
</script>

<DismissModalLayer testid="popover-1" modal={outerModal}>
  <DismissModalLayer testid="popover-2" modal={innerModal} />
</DismissModalLayer>
