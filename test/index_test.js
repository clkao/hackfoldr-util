import { toMarkdown, fromMarkdown } from '../'
import test from 'ava'

test('simple list', (t) => {
  const markdown = `# foo
- [foo](foo.com)
- [bar](bar.com)
`
  const entries = fromMarkdown(markdown)
  t.deepEqual(fromMarkdown(toMarkdown(entries)), entries)
  t.deepEqual(entries, [{ link: 'foo.com', text: 'foo' }, { link: 'bar.com', text: 'bar' }])
})

test('text only', (t) => {
  const markdown = `# foo
- [foo](foo.com)
- baz\`{"label": "zz"}\`
`
  const entries = fromMarkdown(markdown)
  t.deepEqual(fromMarkdown(toMarkdown(entries)), entries)
  t.deepEqual(entries, [{ link: 'foo.com', text: 'foo' }, { text: 'baz', options: {'label': 'zz'} }])
})

test('nested list', (t) => {
  const markdown = `# foo
- [foo](foo.com)
  - [l2-1](l2.com)
    - [l3-1](l3.com)
  - [l2-2](l2.com)
- [bar](bar.com)
`
  const entries = fromMarkdown(markdown)
  t.deepEqual(fromMarkdown(toMarkdown(entries)), entries)
  t.deepEqual(entries, [{ link: 'foo.com', text: 'foo', children: [
    { text: 'l2-1', link: 'l2.com', children: [{ link: 'l3.com', text: 'l3-1' }] },
    { text: 'l2-2', link: 'l2.com' }
  ]}, { link: 'bar.com', text: 'bar' }])
})
