import select from 'unist-util-select'
import u from 'unist-builder'
import remark from 'remark'
import csvParser from 'csv-parse'

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

export function fromCsv (csv) {
  return new Promise(
    function (resolve, reject) {
      csvParser(csv, {relax_column_count: true, skip_empty_lines: true, rtrim: true}, (err, rows) => {
        if (err) return reject(err)
        let header = ['url', 'title', 'options', 'tag']
        if (rows[0][0][0] === '#') {
          header = rows[0].map((x) => x.replace(/^#/, '')).map((x) => header.indexOf(x) > -1 ? x : '')
            .map((x) => x === 'url' ? 'link' : x)
            .map((x) => x === 'title' ? 'text' : x)
          rows.shift()
        }
        resolve(rows.map((row) => {
          let entry = {}
          row.forEach((col, i) => {
            if (header[i]) {
              entry[header[i]] = col
            }
          })
          entry.options = entry.options ? JSON.parse(entry.options) : {}
          if (entry.tag) {
            let tag = entry.tag
            entry.options.label = tag.split(/ /)
          }
          delete entry['tag']
          return entry
        }))
      })
    })
}
