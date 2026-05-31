// @vitest-environment node
import { readFileSync } from 'fs'

const SupportingCard     = new URL('../components/SupportingCard.module.css', import.meta.url)
const EncouragementSheet = new URL('../components/EncouragementSheet.module.css', import.meta.url)

test('SupportingCard.module.css has no hardcoded hex colours', () => {
  expect(readFileSync(SupportingCard, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
})

test('EncouragementSheet.module.css has no hardcoded hex colours', () => {
  expect(readFileSync(EncouragementSheet, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
})

test('SupportingCard maps struggle to coral and wins to the progress token', () => {
  const css = readFileSync(SupportingCard, 'utf8')
  expect(css).toMatch(/var\(--color-coral\)/)
  expect(css).toMatch(/var\(--color-progress-green\)/)
})
