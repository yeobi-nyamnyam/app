// Parses tokens.json (Tokens Studio "single file" export, synced from Figma
// Variables + Text Styles) and generates src/tokens.ts.
// Run via `pnpm --filter @repo/tokens build:tokens`.
//
// Tokens Studio does not export strict W3C DTCG: every leaf has a `$value`
// (and usually a `$type`, though the type names — "fontWeights", "number",
// "letterSpacing", etc — are Tokens Studio's own, not DTCG's). Values can also
// be `{Group.Path}` aliases into another part of the export. This script
// merges the token sets we care about into one namespace, resolves aliases
// against it, and reshapes the result into the flat colors/typography/
// spacing/radius/stroke/icon exports the rest of the codebase already
// expects — so packages/ui's components need no changes when the Figma-side
// naming shifts.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as prettier from 'prettier'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = resolve(__dirname, '..')
const SOURCE_PATH = resolve(PACKAGE_ROOT, 'tokens.json')
const OUTPUT_PATH = resolve(PACKAGE_ROOT, 'src/tokens.ts')

// The Tokens Studio token sets this script reads. Everything else in
// tokens.json ($themes, $metadata, and any other set left over from a
// Figma Variables import) is ignored — these four are self-contained for
// alias resolution and cover every value we export.
const COLOR_PRIMITIVE_SET = 'Color Primitive/Light'
const COLOR_SEMANTIC_SET = 'Color Semantic/Light'
const SIZE_SET = 'Size/Default'
const TEXT_STYLES_SET = 'Text styles'
const NEEDED_SETS = [COLOR_PRIMITIVE_SET, COLOR_SEMANTIC_SET, SIZE_SET, TEXT_STYLES_SET] as const

const TYPOGRAPHY_GROUPS = [
  'Title 1',
  'Title 2',
  'Title 3',
  'Headline',
  'Body',
  'Callout',
  'Subheadline',
  'Footnote',
] as const

// Named weights (as Tokens Studio/Figma label them) → CSS numeric weight
// strings React Native's Text style expects.
const FONT_WEIGHT_NUMERIC: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}

// Size/Default's "Stroke" group uses Figma-side labels that don't map
// mechanically onto our field names — spelled out explicitly so a renamed or
// new stroke token fails loudly instead of silently mismatching.
const STROKE_KEY_MAP: Record<string, string> = {
  Border: 'default',
  'Focus Ring': 'focusRing',
  'Border 05': 'hairline',
}

type TokenTree = { [key: string]: TokenTree | TokenLeaf }
interface TokenLeaf {
  $value: unknown
  $type?: string
}

function isLeaf(node: unknown): node is TokenLeaf {
  return typeof node === 'object' && node !== null && '$value' in node
}

function asTree(node: unknown, context: string): TokenTree {
  if (typeof node !== 'object' || node === null) {
    throw new Error(`Expected an object at ${context}, got ${JSON.stringify(node)}`)
  }
  return node as TokenTree
}

function lookupPath(namespace: TokenTree, path: string[]): unknown {
  let node: unknown = namespace
  for (const segment of path) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[segment]
  }
  return node
}

// Resolves a leaf to its literal value, following `{A.B.C}` alias chains
// against the merged namespace.
function resolveValue(namespace: TokenTree, node: unknown, seen: Set<string> = new Set()): unknown {
  if (!isLeaf(node)) {
    throw new Error(`Expected a token leaf, got: ${JSON.stringify(node)}`)
  }
  const raw = node.$value
  if (typeof raw === 'string' && /^\{.+\}$/.test(raw)) {
    if (seen.has(raw)) throw new Error(`Circular alias reference: ${raw}`)
    seen.add(raw)
    const path = raw.slice(1, -1).split('.')
    const target = lookupPath(namespace, path)
    if (target === undefined) throw new Error(`Could not resolve alias ${raw}`)
    return resolveValue(namespace, target, seen)
  }
  return raw
}

// `value` is a raw $value field (may itself be an alias string); wraps it as
// a leaf so resolveValue can follow alias chains from it.
function resolveNumber(namespace: TokenTree, value: unknown, context: string): number {
  const resolved = resolveValue(namespace, { $value: value })
  if (typeof resolved !== 'number') {
    throw new Error(`Expected a numeric value at ${context}, got ${JSON.stringify(resolved)}`)
  }
  return resolved
}

// `node` is already a full token leaf ({ $value, $type, ... }).
function resolveLeafAsNumber(namespace: TokenTree, node: unknown, context: string): number {
  const resolved = resolveValue(namespace, node)
  if (typeof resolved !== 'number') {
    throw new Error(`Expected a numeric value at ${context}, got ${JSON.stringify(resolved)}`)
  }
  return resolved
}

function normalizeFontWeight(name: string): string {
  const key = name.replace(/\s+/g, '').toLowerCase()
  const weight = FONT_WEIGHT_NUMERIC[key]
  if (!weight) throw new Error(`Unknown font weight name: "${name}" — add it to FONT_WEIGHT_NUMERIC`)
  return weight
}

function toCamelKey(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1)
}

// colors: Color Semantic/Light, walked recursively (Content/Border/Surface ×
// Neutral/Primary/Error/Warn/Success × Default/Subtle/...), aliases resolved
// against the primitive palette.
function buildColors(namespace: TokenTree, semanticTree: TokenTree): Record<string, unknown> {
  function walk(node: TokenTree | TokenLeaf, context: string): unknown {
    if (isLeaf(node)) {
      const value = resolveValue(namespace, node)
      if (typeof value !== 'string') {
        throw new Error(`Expected a resolved color string at ${context}, got ${JSON.stringify(value)}`)
      }
      return value
    }
    const result: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(node)) {
      result[toCamelKey(key)] = walk(child, `${context}.${key}`)
    }
    return result
  }
  return walk(semanticTree, COLOR_SEMANTIC_SET) as Record<string, unknown>
}

// typography: Text styles' composite tokens (Title 1.Bold, Body.Regular, ...)
// → flat title1Bold/bodyRegular/... keys matching the hand-written original.
function buildTypography(namespace: TokenTree, textStylesTree: TokenTree): Record<string, unknown> {
  const familyNode = lookupPath(textStylesTree, ['Family', 'Pretendard'])
  const fontFamily = resolveValue(namespace, familyNode)
  if (typeof fontFamily !== 'string') {
    throw new Error(`Expected Text styles.Family.Pretendard to resolve to a string`)
  }

  const result: Record<string, unknown> = { fontFamily }
  for (const group of TYPOGRAPHY_GROUPS) {
    const groupNode = textStylesTree[group]
    if (!groupNode) throw new Error(`Missing typography group "${group}" in "${TEXT_STYLES_SET}"`)
    const groupKey = group.toLowerCase().replace(/\s+/g, '')
    for (const [variant, token] of Object.entries(asTree(groupNode, `${TEXT_STYLES_SET}.${group}`))) {
      if (!isLeaf(token) || typeof token.$value !== 'object' || token.$value === null) {
        throw new Error(`Expected a typography composite at "${group}.${variant}"`)
      }
      const composite = token.$value as Record<string, unknown>
      const context = `${TEXT_STYLES_SET}.${group}.${variant}`
      const fontSize = resolveNumber(namespace, composite.fontSize, `${context}.fontSize`)
      const fontWeightName = resolveValue(namespace, { $value: composite.fontWeight })
      if (typeof fontWeightName !== 'string') {
        throw new Error(`Expected a string fontWeight at ${context}.fontWeight`)
      }
      const lineHeight = resolveNumber(namespace, composite.lineHeight, `${context}.lineHeight`)
      const letterSpacing = resolveNumber(namespace, composite.letterSpacing, `${context}.letterSpacing`)

      result[`${groupKey}${variant}`] = {
        fontSize,
        fontWeight: normalizeFontWeight(fontWeightName),
        lineHeight,
        letterSpacing,
      }
    }
  }
  return result
}

// spacing/radius/stroke/icon: flat leaf groups under Size/Default, each with
// its own Figma-label → our-key-name rule.
function buildFlatNumberGroup(
  namespace: TokenTree,
  tree: TokenTree,
  context: string,
  toKey: (figmaKey: string) => string,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [figmaKey, node] of Object.entries(tree)) {
    result[toKey(figmaKey)] = resolveLeafAsNumber(namespace, node, `${context}.${figmaKey}`)
  }
  return result
}

function toSpacingKey(figmaKey: string): string {
  if (/^\d+$/.test(figmaKey)) return String(Number(figmaKey)) // "050" -> "50"
  const match = /^Negative (\d+)$/.exec(figmaKey)
  if (match) return `negative${match[1]}`
  throw new Error(`Unexpected spacing key: "${figmaKey}"`)
}

function toRadiusKey(figmaKey: string): string {
  if (figmaKey === 'Radius Full') return 'full'
  const match = /^Radius ([\d-]+)$/.exec(figmaKey)
  const value = match?.[1]
  if (!value) throw new Error(`Unexpected radius key: "${figmaKey}"`)
  return value.replace('-', '.')
}

function toStrokeKey(figmaKey: string): string {
  const mapped = STROKE_KEY_MAP[figmaKey]
  if (!mapped) throw new Error(`Unknown stroke key: "${figmaKey}" — add it to STROKE_KEY_MAP`)
  return mapped
}

function toIconKey(figmaKey: string): string {
  return figmaKey.toLowerCase()
}

// Matches the quoting style of the hand-written original: plain integers and
// valid identifiers stay bare, everything else (e.g. "4.6") is quoted.
function formatKey(key: string): string {
  if (/^[0-9]+$/.test(key)) return key
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return key
  return JSON.stringify(key)
}

function serialize(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  const childPad = '  '.repeat(indent + 1)
  if (typeof value === 'string') return `'${value}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const body = entries
      .map(([key, val]) => `${childPad}${formatKey(key)}: ${serialize(val, indent + 1)},`)
      .join('\n')
    return `{\n${body}\n${pad}}`
  }
  throw new Error(`Unsupported value: ${JSON.stringify(value)}`)
}

async function main() {
  const source = JSON.parse(readFileSync(SOURCE_PATH, 'utf-8')) as Record<string, unknown>

  const namespace: TokenTree = {}
  for (const setName of NEEDED_SETS) {
    const set = source[setName]
    if (!set || typeof set !== 'object') {
      throw new Error(`Missing expected token set "${setName}" in tokens.json`)
    }
    Object.assign(namespace, set)
  }

  const sizeDefault = asTree(source[SIZE_SET], SIZE_SET)
  const exports: Record<string, unknown> = {
    colors: buildColors(namespace, asTree(source[COLOR_SEMANTIC_SET], COLOR_SEMANTIC_SET)),
    typography: buildTypography(namespace, asTree(source[TEXT_STYLES_SET], TEXT_STYLES_SET)),
    spacing: buildFlatNumberGroup(
      namespace,
      asTree(sizeDefault.Spacing, `${SIZE_SET}.Spacing`),
      `${SIZE_SET}.Spacing`,
      toSpacingKey,
    ),
    radius: buildFlatNumberGroup(
      namespace,
      asTree(sizeDefault.Radius, `${SIZE_SET}.Radius`),
      `${SIZE_SET}.Radius`,
      toRadiusKey,
    ),
    stroke: buildFlatNumberGroup(
      namespace,
      asTree(sizeDefault.Stroke, `${SIZE_SET}.Stroke`),
      `${SIZE_SET}.Stroke`,
      toStrokeKey,
    ),
    icon: buildFlatNumberGroup(
      namespace,
      asTree(sizeDefault.Icon, `${SIZE_SET}.Icon`),
      `${SIZE_SET}.Icon`,
      toIconKey,
    ),
  }

  const exportBlocks = Object.entries(exports)
    .map(([name, value]) => `export const ${name} = ${serialize(value, 0)} as const`)
    .join('\n\n')

  const header =
    '// AUTO-GENERATED by scripts/build-tokens.ts from tokens.json — do not edit by hand.\n' +
    '// Source of truth: Figma, synced via Tokens Studio. Edit tokens.json (or Figma) instead.\n\n'

  // No repo-wide .prettierrc exists yet (CLAUDE.md documents singleQuote/semi
  // conventions without a committed config file), so pin them here to match the
  // hand-written style this file replaces.
  const formatted = await prettier.format(header + exportBlocks + '\n', {
    parser: 'typescript',
    singleQuote: true,
    semi: false,
    printWidth: 100,
  })

  writeFileSync(OUTPUT_PATH, formatted)
}

main()
