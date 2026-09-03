import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Blocks, Braces, Code2, Database, FileCode2, Network, Radio, TerminalSquare, Wallet } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import CopyButton from '../components/CopyButton'
import { NETWORKS } from '../config/networks'

const tools = [
  [Braces, 'Solidity', 'Deploy EVM smart contracts with familiar language and tooling.'],
  [Radio, 'JSON-RPC', 'Use Ethereum-style RPC workflows for applications and infrastructure.'],
  [Wallet, 'Wallets', 'Connect injected EVM wallets or WalletConnect and switch to Rabbit.'],
  [TerminalSquare, 'CLI / Node', 'Operate Rabbit infrastructure and inspect the network directly.'],
]

export default function Developers() {
  const t = NETWORKS.testnet
  return (
    <main>
      <section className="page-hero developer-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> EVM DEVELOPER SURFACE</span><h1>Familiar tooling. <em>Rabbit consensus underneath.</em></h1><p>Build on Rabbit Testnet with EVM contracts, Ethereum-style JSON-RPC and familiar wallet flows while LCQ handles producer coordination below execution.</p><div className="hero-ctas"><a className="button primary" href="#start">Start building <ArrowRight size={15} /></a><Link className="button secondary" to="/docs">Read docs</Link></div></div><div className="code-card"><div className="code-card-head"><span>rabbit.config.ts</span><b>TESTNET</b></div><pre><code><span>export const</span> rabbitTestnet = {'{'}{`\n`}  chainId: <b>9280</b>,{`\n`}  nativeCurrency: {'{'} symbol: <em>'tRAB'</em>, decimals: <b>18</b> {'}'},{`\n`}  rpcUrl: <em>'{t.rpcUrl}'</em>,{`\n`}  explorer: <em>'{t.explorerUrl}'</em>{`\n`}{'}'}</code></pre><div className="code-card-foot"><span><Blocks size={14} />EVM</span><span><Network size={14} />LCQ consensus</span><span><Code2 size={14} />Open source</span></div></div></div></section>

      <section className="section shell" id="start"><SectionHeader eyebrow="DEVELOPER START" title="The shortest path from zero to Rabbit." text="Testnet is the default development environment before Mainnet opens." /><div className="developer-steps"><article><span>01</span><h3>Connect Testnet</h3><p>Use Chain ID 9280 and the official live Rabbit Testnet RPC.</p></article><article><span>02</span><h3>Earn gas & fund tests</h3><p>Mine your first tRAB for gas. Then use the participant faucet for 10 tRAB or 1,000 tRUSD per claim, with a 24-hour cooldown.</p></article><article><span>03</span><h3>Deploy & call</h3><p>Use EVM contracts and familiar JSON-RPC transaction workflows.</p></article><article><span>04</span><h3>Inspect</h3><p>Confirm transactions and contracts through the Rabbit explorer.</p></article></div></section>

      <section className="developer-tools"><div className="shell"><SectionHeader eyebrow="TOOLING" title="Standard EVM surfaces, Rabbit network." /><div className="tool-grid">{tools.map(([Icon, title, text]) => <article key={title}><Icon size={21} /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="section shell" id="networks"><SectionHeader eyebrow="NETWORK CONFIGURATION" title="Public Testnet live. Mainnet comes later." text="Use the live Testnet parameters now and keep Mainnet disabled until its separate launch." /><div className="network-config-table"><div className="network-config-head"><span>Network</span><span>Chain ID</span><span>RPC</span><span>Explorer</span><span>Status</span></div><div><b>Rabbit Testnet</b><code>9280 / 0x2440</code><code>{t.rpcUrl}</code><code>{t.explorerUrl}</code><em>{t.networkLive ? 'LIVE' : 'PRE-LAUNCH'}</em></div><div><b>Rabbit Mainnet</b><code>928 / 0x3a0</code><code>{NETWORKS.mainnet.rpcUrl}</code><code>{NETWORKS.mainnet.explorerUrl}</code><em>{NETWORKS.mainnet.networkLive ? 'LIVE' : 'AFTER TESTNET'}</em></div></div></section>

      <section className="rpc-section" id="rpc"><div className="shell rpc-grid"><div><span className="section-kicker">JSON-RPC</span><h2>Use a standard Ethereum request.</h2><p>The request shape stays familiar and the official Rabbit Testnet HTTPS RPC is live.</p><div className="rpc-endpoint"><code>{t.rpcUrl}</code><CopyButton value={t.rpcUrl} /></div></div><pre><code>curl -X POST {`\\`}{`\n`}  -H <em>'Content-Type: application/json'</em> {`\\`}{`\n`}  --data <em>'{'{'}"jsonrpc":"2.0",{`\n`}    "method":"eth_chainId",{`\n`}    "params":[],"id":1{'}'}'</em> {`\\`}{`\n`}  <b>{t.rpcUrl}</b></code></pre></div></section>

      <section className="section shell"><SectionHeader eyebrow="DEVELOPER RESOURCES" title="A portal, not a pile of links." /><div className="resource-grid"><Link to="/docs"><FileCode2 size={22} /><span>DOCUMENTATION</span><h3>Technical reference</h3><p>Architecture, network configuration, wallets and protocol references.</p><b>Open docs <ArrowRight size={14} /></b></Link><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2 size={22} /><span>SOURCE</span><h3>Official GitHub</h3><p>Public repositories, releases and website history.</p><b>GitHub <ArrowUpRight size={14} /></b></a><Link to="/nodes"><Database size={22} /><span>INFRASTRUCTURE</span><h3>Run a node</h3><p>Operate P2P, RPC and independent network services.</p><b>Node guide <ArrowRight size={14} /></b></Link></div></section>
    </main>
  )
}
