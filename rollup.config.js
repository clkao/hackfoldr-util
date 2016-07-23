import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js'

const pkg = require('./package.json')
const external = Object.keys(pkg.dependencies)
const bundled = process.env.BROWSER === 'true'
const min = process.env.BROWSER === 'true'

const plugins = [
  builtins(),
  nodeResolve({
    jsnext: true,
    main: true,
    builtins: true,
    browser: bundled
  }),
  json({}),
  commonjs({
    include: 'node_modules/**',
    ignoreGlobal: true
  }),
  babel(babelrc())
]

if (min) plugins.push(uglify({}, minify))

export default {
  entry: 'lib/index.js',
  plugins: plugins,
  external: bundled ? [] : external,
  targets: [
    {
      dest: bundled ? pkg['browser'] : pkg['main'],
      format: 'umd',
      moduleName: 'hackfoldrUtil',
      sourceMap: true
    }
  ]
}
