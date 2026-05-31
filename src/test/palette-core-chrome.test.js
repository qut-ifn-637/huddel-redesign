// @vitest-environment node
import { readFileSync } from 'fs'

const files = {
  CompleteControl: new URL('../components/CompleteControl.module.css', import.meta.url),
  MilestoneCard:   new URL('../components/MilestoneCard.module.css', import.meta.url),
  BottomNav:       new URL('../components/BottomNav.module.css', import.meta.url),
  SegmentedToggle: new URL('../components/SegmentedToggle.module.css', import.meta.url),
  SkipButton:      new URL('../components/SkipButton.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}

test('SkipButton uses the coral accent', () => {
  expect(readFileSync(files.SkipButton, 'utf8')).toMatch(/color:\s*var\(--color-coral\)/)
})

test('BottomNav uses the cream surface', () => {
  expect(readFileSync(files.BottomNav, 'utf8')).toMatch(/background:\s*var\(--color-cream\)/)
})
