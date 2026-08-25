import { ArrowRight, Blocks, Braces, Code2, Copy, Database, ExternalLink, FileCode2, Network, Radio, TerminalSquare, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import CopyButton from '../components/CopyButton'
import StatusDot from '../components/StatusDot'
import { NETWORKS } from '../config/networks'

const toolCards=[
  [Braces,'Solidity','Deploy EVM smart contracts with familiar language and tooling.'],
  [Radio,'JSON-RPC','Use Ethereum-style RPC workflows for applications and infrastructure.'],
  [Wallet,'Wallets','Connect EVM-compatible wallets and switch to Rabbit when public RPC is active.'],
  [TerminalSquare,'CLI / Node','Operate Rabbit infrastructure and inspect the network directly.']
]

export default function Developers(){const t=NETWORKS.testnet;return <main>
  <section className="page-hero dev-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="tech">EVM DEVELOPER SURFACE</StatusDot><span className="page-kicker">BUILD ON RABBIT</span><h1>Build on Testnet.<br/><em>Ship when Mainnet is ready.</em></h1><p>Rabbit keeps application execution familiar so developers can focus on products while LCQ differentiates consensus underneath.</p><div className="hero-ctas"><a className="button primary" href="#start">Start building <ArrowRight size={15}/></a><Link className="button secondary" to="/docs">Read docs</Link></div></div><div className="dev-hero-code"><div className="code-head"><span>rabbit.config.ts</span><small>PUBLIC TESTNET</small></div><pre><code><span>export const</span> rabbitTestnet = {'{'}{`\n`}  chainId: <b>9280</b>,{`\n`}  nativeCurrency: {'{'} symbol: <em>'RAB'</em>, decimals: <b>18</b> {'}'},{`\n`}  rpcUrl: <em>'{t.rpcUrl}'</em>,{`\n`}  explorer: <em>'{t.explorerUrl}'</em>{`\n`}{'}'}</code></pre><div className="dev-code-foot"><span><Blocks size={14}/>EVM</span><span><Network size={14}/>LCQ beneath execution</span></div></div></div></section>
  <section className="page-section shell" id="start"><SectionHeader eyebrow="DEVELOPER START" title="The shortest path from zero to Rabbit." text="The public Testnet should be the default developer environment before Mainnet opens." />
    <div className="dev-start-grid"><article><span>01</span><h3>Connect Testnet</h3><p>Use Chain ID 9280 and the official RPC after public activation.</p></article><article><span>02</span><h3>Fund a wallet</h3><p>Use Testnet RAB from the faucet; RUSD is also planned as a Testnet asset.</p></article><article><span>03</span><h3>Deploy & call</h3><p>Use EVM contracts and familiar JSON-RPC transaction workflows.</p></article><article><span>04</span><h3>Inspect</h3><p>Confirm transactions and contracts through the Rabbit explorer.</p></article></div>
  </section>
  <section className="developer-tools"><div className="shell"><SectionHeader eyebrow="TOOLING SURFACE" title="Familiar tools, Rabbit network." />
    <div className="tool-grid">{toolCards.map(([Icon,title,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>
  <section className="page-section shell" id="networks"><SectionHeader eyebrow="NETWORK CONFIGURATION" title="Testnet first. Mainnet already reserved." text="Do not hard-code endpoints across the application. Use a central network configuration and activate services only when they are public." />
    <div className="network-config-table"><div className="network-config-head"><span>Network</span><span>Chain ID</span><span>RPC</span><span>Explorer</span><span>Status</span></div><div><b>Rabbit Testnet</b><code>9280 / 0x2440</code><code>{t.rpcUrl}</code><code>{t.explorerUrl}</code><em>PRE-LAUNCH</em></div><div><b>Rabbit Mainnet</b><code>928 / 0x3a0</code><code>{NETWORKS.mainnet.rpcUrl}</code><code>{NETWORKS.mainnet.explorerUrl}</code><em>AFTER TESTNET</em></div></div>
  </section>
  <section className="rpc-deep" id="rpc"><div className="shell rpc-deep-grid"><div><span>JSON-RPC</span><h2>Connect with a standard Ethereum request.</h2><p>The request shape remains familiar. The public endpoint is intentionally marked unavailable until Testnet activation.</p><div className="rpc-endpoint"><code>{t.rpcUrl}</code><CopyButton value={t.rpcUrl}/></div></div><pre><code>curl -X POST {`\\`}{`\n`}  -H <em>'Content-Type: application/json'</em> {`\\`}{`\n`}  --data <em>'{'{'}"jsonrpc":"2.0",{`\n`}    "method":"eth_chainId",{`\n`}    "params":[],"id":1{'}'}'</em> {`\\`}{`\n`}  <b>{t.rpcUrl}</b></code></pre></div></section>
  <section className="page-section shell"><SectionHeader eyebrow="DEVELOPER RESOURCES" title="A portal, not a pile of links." />
    <div className="resource-grid"><Link to="/docs"><FileCode2/><h3>Documentation</h3><p>Architecture, network configuration and technical references.</p><span>Open docs <ArrowRight size={14}/></span></Link><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2/><h3>Source code</h3><p>Official Rabbit repositories, releases and website history.</p><span>GitHub <ExternalLink size={14}/></span></a><Link to="/nodes"><Database/><h3>Run infrastructure</h3><p>Operate nodes, RPC and independent network services.</p><span>Node guide <ArrowRight size={14}/></span></Link></div>
  </section>
</main>}
