<script lang="ts">
  import { Switch } from '$lib/components/switch'
  let {
    checked = $bindable(false),
    disabled = false,
    readOnly = false,
    required = false,
    name = undefined,
    value = undefined,
    onCheckedChange = undefined
  } = $props()
</script>

<Switch.Root {checked} {disabled} {readOnly} {required} {name} {value} {onCheckedChange}>
  <Switch.Thumb />
</Switch.Root>
