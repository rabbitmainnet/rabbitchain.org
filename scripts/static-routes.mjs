import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { canonicalFor, metaFor } from '../src/config/route-meta.js'

const routes = [
  '/about',
  '/community',
  '/developers',
  '/docs',
  '/embed/factory',
  '/embed/faucet',
  '/embed/launchpool',
  '/embed/liquidity',
  '/embed/mining',
  '/embed/swap',
  '/embed/vrf',
  '/launchpool',
  '/lcq',
  '/mainnet',
  '/mining',
  '/nodes',
  '/platform',
  '/platform/bridge',
  '/platform/factory',
  '/platform/faucet',
  '/platform/fx',
  '/platform/launchpool',
  '/platform/liquidity',
  '/platform/p2p',
  '/platform/staking',
  '/platform/swap',
  '/platform/vrf',
  '/privacy-policy',
  '/rab',
  '/releases',
  '/risk-disclosure',
  '/security',
  '/status',
  '/terms-and-conditions',
  '/testnet',
  '/vrf',
  '/whitepaper',
]

const template = await readFile('dist/index.html', 'utf8')
const escape = value => value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char])

for (const route of ['/', ...routes]) {
  const [title, description] = metaFor(route)
  const canonical = canonicalFor(route)
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta (?:name|property)="(?:og:|twitter:)?description" content=")[^"]*/g, (_, start) => start + escape(description))
    .replace(/(<meta (?:name|property)="(?:og|twitter):title" content=")[^"]*/g, (_, start) => start + escape(title))
    .replace(/(<meta property="og:url" content="|<link rel="canonical" href=")[^"]*/g, (_, start) => start + canonical)
  const destination = join('dist', route)
  await mkdir(destination, { recursive: true })
  await writeFile(join(destination, 'index.html'), html)
}

await writeFile('dist/404.html', template)
