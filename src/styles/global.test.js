// @vitest-environment node
import { readFileSync } from 'fs'

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8')

test('global.css adds the warm-refresh palette tokens', () => {
  expect(css).toMatch(/--color-cream:\s*#fbf5ee/)
  expect(css).toMatch(/--color-coral:\s*#d2603a/)
  expect(css).toMatch(/--color-coral-tint:\s*#fadfce/)
  expect(css).toMatch(/--color-line:\s*#e7ddd0/)
  expect(css).toMatch(/--color-lavender-line:\s*#e3d9ee/)
  expect(css).toMatch(/--color-muted:\s*#9a8f92/)
  expect(css).toMatch(/--color-progress-green:\s*#2c9e63/)
  expect(css).toMatch(/--color-progress-tint:\s*#e7f7ee/)
})

test('global.css remaps the base tokens to warm values', () => {
  expect(css).toMatch(/--color-black:\s*#2b2230/)
  expect(css).toMatch(/--color-body-gray:\s*#6a5f60/)
  expect(css).toMatch(/--color-beige:\s*#f3ecf3/)
  expect(css).toMatch(/--color-purple-tint:\s*#efe6f5/)
  expect(css).toMatch(/--color-soft-blue:\s*#f3ece2/)
})

test('the app paper (#root) uses the cream token', () => {
  expect(css).toMatch(/#root\s*\{[^}]*background:\s*var\(--color-cream\)/)
})
