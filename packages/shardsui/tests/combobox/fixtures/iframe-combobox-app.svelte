<script lang="ts">
  import { mount, unmount } from 'svelte'
  import IframeModalCombobox from './iframe-modal-combobox.svelte'

  let innerRoot = $state<HTMLDivElement | null>(null)

  $effect(() => {
    const container = innerRoot
    if (!container) return

    const iframe = document.createElement('iframe')
    iframe.setAttribute('data-testid', 'iframe')
    iframe.src = 'about:blank'
    iframe.style.height = '300px'
    container.appendChild(iframe)

    const iframeDocument = iframe.contentWindow?.document
    let app: ReturnType<typeof mount> | undefined

    if (iframeDocument) {
      iframeDocument.open()
      iframeDocument.write('<div id="rootIframe"></div>')
      iframeDocument.close()

      const root = iframeDocument.getElementById('rootIframe')
      if (root) {
        app = mount(IframeModalCombobox, { target: root })
      }
    }

    return () => {
      if (app) unmount(app)
      iframe.remove()
    }
  })
</script>

<div bind:this={innerRoot}></div>
