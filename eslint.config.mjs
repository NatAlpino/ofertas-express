
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importX from 'eslint-plugin-import-x'
import { defineConfig, globalIgnores } from 'eslint/config'

const sortKey = (path) => path.replace(/^[^a-z0-9]+/i, '').toLowerCase()

const modulePath = (text) => /from\s+['"]([^'"]+)['"]/.exec(text)?.[1] ?? text

const comparePaths = (a, b) => {
  const ka = sortKey(modulePath(a))
  const kb = sortKey(modulePath(b))
  return ka < kb ? -1 : ka > kb ? 1 : a < b ? -1 : a > b ? 1 : 0
}

// Buckets mirror import-x/order groups + pathGroups ranking, so we never
// reorder across boundaries — only alphabetically within a run of one kind.
const PATH_GROUPS = ['@/components/', '@/hooks/', '@/content/', '@/mocks/', '@/utils/', '@/stores/']
const bucket = (path) => {
  if (path.startsWith('.')) return 'relative'
  const rank = PATH_GROUPS.findIndex((prefix) => path.startsWith(prefix))
  if (rank !== -1) return `internal:${rank}`
  if (path.startsWith('@/')) return 'internal:rest'
  return 'external'
}

const sortedImports = {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context) {
    const sourceCode = context.sourceCode

    return {
      Program(program) {
        const body = program.body
        let i = 0
        while (i < body.length) {
          if (body[i].type !== 'ImportDeclaration') {
            i++
            continue
          }
          let j = i
          while (j + 1 < body.length && body[j + 1].type === 'ImportDeclaration') {
            const between = sourceCode.text.slice(body[j].range[1], body[j + 1].range[0])
            if (/\n[ \t]*\n/.test(between)) break
            j++
          }
          const block = body.slice(i, j + 1)

          // Text of each import, including comments attached above it.
          const texts = block.map((node, k) => {
            const start = k === 0 ? node.range[0] : block[k - 1].range[1]
            return sourceCode.text.slice(start, node.range[1])
          })

          // Sort only maximal runs of imports from the same bucket.
          const sorted = texts.slice()
          let runStart = 0
          while (runStart < sorted.length) {
            const runBucket = bucket(modulePath(sorted[runStart]))
            let runEnd = runStart + 1
            while (runEnd < sorted.length && bucket(modulePath(sorted[runEnd])) === runBucket)
              runEnd++
            const run = sorted.slice(runStart, runEnd).sort(comparePaths)
            sorted.splice(runStart, runEnd - runStart, ...run)
            runStart = runEnd
          }

          if (JSON.stringify(sorted) !== JSON.stringify(texts)) {
            const first = block[0]
            const last = block[block.length - 1]
            context.report({
              node: first,
              message: 'Imports should be sorted alphabetically, ignoring leading punctuation.',
              fix(fixer) {
                return fixer.replaceTextRange(
                  [first.range[0], last.range[1]],
                  sorted.join('\n'),
                )
              },
            })
          }
          i = j + 1
        }
      },
    }
  },
}

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      'import-x': importX,
      'local-rules': { rules: { 'sorted-imports': sortedImports } },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            { pattern: '@/components/**', group: 'internal', position: 'before' },
            { pattern: '@/hooks/**', group: 'internal', position: 'before' },
            { pattern: '@/content/**', group: 'internal', position: 'before' },
            { pattern: '@/mocks/**', group: 'internal', position: 'before' },
            { pattern: '@/utils/**', group: 'internal', position: 'before' },
            { pattern: '@/stores/**', group: 'internal', position: 'before' },
            { pattern: '@/**', group: 'internal' },
          ],
          'newlines-between': 'always',
        },
      ],
      'local-rules/sorted-imports': 'error',
    },
  },

  globalIgnores([
    '.next/**',
    'node_modules/**',
    'out/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'public/mockServiceWorker.js',
  ]),
])
