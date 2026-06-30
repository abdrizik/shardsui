type MockProbeImage = {
  complete: boolean
  naturalWidth: number
  onload: (() => void) | null
  onerror: (() => void) | null
  referrerPolicy: string
  crossOrigin: string | null
  sizes: string
  src: string
  srcset: string
}

/** Replaces `window.Image` and collects every probe the image part constructs. */
export function mockImageProbe({ completeOnSet = false, naturalWidth = 100 } = {}): {
  images: MockProbeImage[]
  restore: () => void
} {
  const original = window.Image
  const images: MockProbeImage[] = []

  window.Image = function MockImage() {
    let srcValue = ''
    let srcSetValue = ''
    const markComplete = () => {
      obj.complete = true
      obj.naturalWidth = naturalWidth
    }
    const obj: MockProbeImage = {
      complete: false,
      naturalWidth: 0,
      onload: null,
      onerror: null,
      referrerPolicy: '',
      crossOrigin: null,
      sizes: '',
      get src() {
        return srcValue
      },
      set src(value: string) {
        srcValue = value
        if (completeOnSet) markComplete()
      },
      get srcset() {
        return srcSetValue
      },
      set srcset(value: string) {
        srcSetValue = value
        if (completeOnSet) markComplete()
      }
    }
    images.push(obj)
    return obj
  } as unknown as typeof window.Image

  return {
    images,
    restore() {
      window.Image = original
    }
  }
}
