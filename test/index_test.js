import { toMarkdown, fromMarkdown } from '../'
import { deepEqual } from 'assert'

describe('fromMarkdown', () => {
  it('simple list', () => {
    const markdown = `# foo
- [foo](foo.com)
- [bar](bar.com)
`
    const entries = fromMarkdown(markdown)
    deepEqual(fromMarkdown(toMarkdown(entries)), entries)
    deepEqual(entries, [{ link: 'foo.com', text: 'foo' }, { link: 'bar.com', text: 'bar' }])
  })

  it('text only', () => {
    const markdown = `# foo
- [foo](foo.com)
- baz\`{"label": "zz"}\`
`
    const entries = fromMarkdown(markdown)
    deepEqual(fromMarkdown(toMarkdown(entries)), entries)
    deepEqual(entries, [{ link: 'foo.com', text: 'foo' }, { text: 'baz', options: {'label': 'zz'} }])
  })

  it('nested list', () => {
    const markdown = `# foo
- [foo](foo.com)
  - [l2-1](l2.com)
    - [l3-1](l3.com)
  - [l2-2](l2.com)
- [bar](bar.com)
`
    const entries = fromMarkdown(markdown)
    deepEqual(fromMarkdown(toMarkdown(entries)), entries)
    deepEqual(entries, [{ link: 'foo.com', text: 'foo', children: [
      { text: 'l2-1', link: 'l2.com', children: [{ link: 'l3.com', text: 'l3-1' }] },
      { text: 'l2-2', link: 'l2.com' }
    ]}, { link: 'bar.com', text: 'bar' }])
  })
})
