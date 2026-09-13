import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const part1 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-1.part'), 'utf8')
const part2 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-2.part'), 'utf8')
const svg = `${part1}${part2}`

if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
  throw new Error('Fluxo MM inválido: SVG não foi montado corretamente.')
}

writeFileSync(resolve(root, 'public/fluxo-operacional-mm.svg'), svg, 'utf8')
console.log('Fluxo MM montado como arquivo SVG físico.')
