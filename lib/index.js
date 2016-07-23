import select from 'unist-util-select'
import u from 'unist-builder'
import remark from 'remark'

function populate (ast) {
  const items = select(ast, ':root > list > listItem')

  return items.map(node => {
    const [paragraph] = select(node, ':root > paragraph')
    let [link] = select(paragraph, 'link')
    var text
    if (link) {
      [text] = select(link, 'text')
      link = link.url
    } else {
      [text] = select(paragraph, 'text')
    }
    text = text.value
    var [options] = select(paragraph, 'inlineCode')
    if (options) {
      options = JSON.parse(options.value)
    }
    const children = populate(node)
    let res = { text }
    if (children && children.length) res.children = children
    if (link) res.link = link
    if (options) res.options = options
    return res
  })
}

export function fromMarkdown (markdown) {
  const ast = remark().parse(markdown)
  return populate(ast)
}

export function toMarkdown (entries) {
  return remark().stringify(u('root', generate({children: entries})))
}

function generate ({link, text, options, children}) {
  const res = []
  if (text) {
    const _options = []
    if (options) {
      _options.push(u('inlineCode', {value: JSON.stringify(options)}))
    }
    var _text = u('text', text)
    if (link) {
      _text = u('link', { url: link }, [_text])
    }
    res.push(u('paragraph', [_text].concat(_options))
    )
  }
  if (children && children.length) {
    res.push(u('list', { ordered: false, loose: false }, children.map(child => {
      return u('listItem', { loose: false }, generate(child))
    })))
  }
  return res
}
