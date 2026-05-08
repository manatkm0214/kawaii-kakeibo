#!/usr/bin/env node
// Patches Next.js 15.x bug where generateBuildId is undefined when no config is set.
const fs = require('fs')
const path = require('path')

const files = [
  path.join(__dirname, '../node_modules/next/dist/build/generate-build-id.js'),
  path.join(__dirname, '../node_modules/next/dist/esm/build/generate-build-id.js'),
]

const OLD = 'async function generateBuildId(generate, fallback) {\n    let buildId = await generate();'
const ESM_OLD = 'export async function generateBuildId(generate, fallback) {\n    let buildId = await generate();'
const NEW = 'async function generateBuildId(generate, fallback) {\n    if (typeof generate !== \'function\') generate = async () => null;\n    let buildId = await generate();'
const ESM_NEW = 'export async function generateBuildId(generate, fallback) {\n    if (typeof generate !== \'function\') generate = async () => null;\n    let buildId = await generate();'

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping (not found): ${file}`)
    continue
  }
  let content = fs.readFileSync(file, 'utf8')
  if (content.includes('typeof generate !== \'function\'')) {
    console.log(`Already patched: ${file}`)
    continue
  }
  const isEsm = file.includes('/esm/')
  const replaced = content.replace(isEsm ? ESM_OLD : OLD, isEsm ? ESM_NEW : NEW)
  if (replaced === content) {
    console.log(`No match found (version may differ): ${file}`)
    continue
  }
  fs.writeFileSync(file, replaced, 'utf8')
  console.log(`Patched: ${file}`)
}
