import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const part1 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-1.part'), 'utf8')
const part2 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-2.part'), 'utf8')
const svg = `${part1}${part2}`

if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
  throw new Error('Fluxo MM inválido: SVG não foi montado corretamente.')
}

const svgPath = resolve(root, 'public/fluxo-operacional-mm-source.svg')
const pngPath = resolve(root, 'public/fluxo-operacional-mm.png')

writeFileSync(svgPath, svg, 'utf8')

execFileSync(
  'rsvg-convert',
  [
    '--format=png',
    '--width=2400',
    '--height=1600',
    '--background-color=#ffffff',
    '--output',
    pngPath,
    svgPath,
  ],
  { stdio: 'inherit' },
)

console.log('Fluxo MM convertido para PNG físico em 2400x1600.')
