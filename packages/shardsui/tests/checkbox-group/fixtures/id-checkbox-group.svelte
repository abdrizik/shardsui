<script lang="ts">
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { id }: { id?: string } = $props()
</script>

<CheckboxGroup {id} />
