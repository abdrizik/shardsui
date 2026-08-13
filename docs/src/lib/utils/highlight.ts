import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers'
import { codeToHtml } from 'shiki'

export const shikiThemes = { light: githubLight, dark: githubDark }

export const shikiTransformers = [
  transformerNotationDiff(),
  transformerNotationHighlight(),
  transformerNotationFocus(),
  transformerNotationErrorLevel(),
  transformerNotationWordHighlight(),
  transformerMetaHighlight(),
  transformerMetaWordHighlight()
]

export async function highlight(code: string, lang: string) {
  return await codeToHtml(code, {
    lang,
    themes: shikiThemes,
    defaultColor: false,
    tabindex: false,
    transformers: shikiTransformers
  })
}
