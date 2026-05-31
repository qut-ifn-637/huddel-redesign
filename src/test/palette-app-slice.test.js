// @vitest-environment node
import { readFileSync } from 'fs'

const files = {
  MyHuddleView:         new URL('../screens/MyHuddleView.module.css', import.meta.url),
  EncouragementsScreen: new URL('../screens/EncouragementsScreen.module.css', import.meta.url),
  ReturnView:           new URL('../screens/ReturnView.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}

test('ReturnView applies coral to its secondary actions', () => {
  expect(readFileSync(files.ReturnView, 'utf8')).toMatch(/var\(--color-coral\)/)
})
