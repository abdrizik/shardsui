<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Combobox } from '$lib/components/combobox'
  import { Select } from '$lib/components/select'

  let { orientation }: { orientation?: 'horizontal' | 'vertical' } = $props()
</script>

<Autocomplete.Separator {orientation} data-testid="Autocomplete.Separator" />
<Combobox.Separator {orientation} data-testid="Combobox.Separator" />
<Select.Separator {orientation} data-testid="Select.Separator" />
