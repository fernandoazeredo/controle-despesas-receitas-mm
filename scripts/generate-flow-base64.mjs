import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const part1 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-1.part'), 'utf8')
const part2 = readFileSync(resolve(root, 'public/fluxo-operacional-svg-2.part'), 'utf8')
const svg = `${part1}${part2}`

if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
  throw new Error('Fluxo MM inválido: SVG não foi montado corretamente.')
}

const encoded = Buffer.from(svg, 'utf8').toString('base64')
const partCount = 5

for (let index = 0; index < partCount; index += 1) {
  const start = Math.floor((encoded.length * index) / partCount)
  const end = Math.floor((encoded.length * (index + 1)) / partCount)
  writeFileSync(
    resolve(root, `public/fluxo-operacional-${index + 1}.b64`),
    encoded.slice(start, end),
    'utf8',
  )
}

console.log(`Fluxo MM convertido para Base64 em ${partCount} partes.`)
