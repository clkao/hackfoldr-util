import { fromCsv } from '../'
import test from 'ava'

test('simple csv', (t) => {
  const csv = `#url,#title,#options,#tag,,useless
foo.com,"foo bar",,XXX:warning
bar.com,"alright","{""expand"":true}",,YYY:error
`
  return fromCsv(csv).then(entries => {
    t.deepEqual(entries, [
      { link: 'foo.com', text: 'foo bar', options: { label: ['XXX:warning'] } },
      { link: 'bar.com', text: 'alright', options: { expand: true } } ])
  })
})
