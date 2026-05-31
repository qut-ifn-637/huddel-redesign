// @vitest-environment node
import { readFileSync } from 'fs'

const files = {
  GoalActions:   new URL('../screens/GoalActions.module.css', import.meta.url),
  GoalSetup:     new URL('../screens/GoalSetup.module.css', import.meta.url),
  OfferedSocial: new URL('../screens/OfferedSocial.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}
