import { useMemo, useState } from 'react'
import { BookOpen, ChevronRight, Code2, Cpu, FileCheck2, FileCode2, Network, Search, ShieldCheck, Wallet } from 'lucide-react'
import { NETWORKS } from '../config/networks'

const sections = [
  { id: 'overview', title: 'Overview', icon: BookOpen, body: [['Rabbit Chain', 'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. Rabbit Testnet launches first; Mainnet follows public validation.'], ['Core principle', 'One wallet. One fair chance. Valid participation feeds eligibility while LCQ coordinates producer opportunities.']] },
  { id: 'testnet', title: 'Rabbit Testnet', icon: Network, body: [['Purpose', 'The first public network for miners, nodes, wallets, applications and infrastructure.'], ['Chain ID', '9280 (0x2440)'], ['Native asset', 'tRAB (testnet only; no guaranteed monetary value).'], ['Status', 'Live with public P2P, HTTPS RPC, WebSocket RPC and explorer.']] },
  { id: 'mainnet', title: 'Rabbit Mainnet', icon: Network, body: [['Purpose', 'The production Rabbit network that launches after successful Testnet validation.'], ['Chain ID', '928 (0x3a0)'], ['Native asset', 'RAB'], ['Status', 'Not launched. Production endpoints remain reserved.']] },
  { id: 'lcq', title: 'LCQ Consensus', icon: Cpu, body: [['Flow', 'Work → Eligibility → Live Consensus Queue → Producer → Committee.'], ['Reward model', '70% producer / 30% committee.'], ['Execution', 'EVM execution remains separate from consensus coordination.']] },
  { id: 'wallets', title: 'Wallets', icon: Wallet, body: [['Injected wallets', 'RabbitChain.org discovers compatible browser wallets through EIP-6963.'], ['WalletConnect', 'QR and remote-wallet connections use the official Rabbit WalletConnect project configuration.'], ['Network setup', 'Rabbit Testnet uses Chain ID 9280 (0x2440). Add/switch requests are sent through the wallet native EVM flow.']] },
  { id: 'rpc', title: 'Developer Reference', icon: Code2, body: [['Testnet RPC', NETWORKS.testnet.rpcUrl], ['Testnet Explorer', NETWORKS.testnet.explorerUrl], ['Mainnet RPC', NETWORKS.mainnet.rpcUrl], ['Mainnet Explorer', NETWORKS.mainnet.explorerUrl]] },
  { id: 'releases', title: 'Releases', icon: FileCheck2, body: [['Binaries', 'Rabbit Core Testnet v1 is published for Windows AMD64 and Linux AMD64.'], ['Verification', 'Verify the official archive and internal SHA-256 manifests before running binaries.']] },
  { id: 'security', title: 'Security', icon: ShieldCheck, body: [['Wallet safety', 'RabbitChain.org should never request a seed phrase or private key. Wallet connection alone does not require a signature.'], ['Official sources', 'Verify domains, binaries and repositories from rabbitchain.org and github.com/rabbitmainnet.']] },
]

export default function Docs() {
  const [active, setActive] = useState('overview')
  const [query, setQuery] = useState('')
  const current = sections.find((section) => section.id === active) || sections[0]
  const filtered = useMemo(() => sections.filter((section) => section.title.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="docs-page">
      <div className="shell docs-shell">
        <aside className="docs-sidebar">
          <div className="docs-brand"><span>RABBIT DOCS</span><h2>Documentation</h2><p>Official protocol and network reference.</p></div>
          <label className="docs-search"><Search size={15} /><input placeholder="Filter documentation" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <nav>{filtered.map((section) => { const Icon = section.icon; return <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => setActive(section.id)}><span><Icon size={15} />{section.title}</span><ChevronRight size={13} /></button> })}</nav>
          <div className="docs-aside-note"><b>Launch order</b><p>Testnet 9280 first. Mainnet 928 after validation.</p></div>
        </aside>
        <article className="docs-content">
          <span className="docs-eyebrow">RABBIT CHAIN / {current.title.toUpperCase()}</span>
          <h1>{current.title}</h1>
          <p className="docs-lead">Official technical reference for the Rabbit network. Service readiness is kept separate from reserved network configuration.</p>
          {current.body.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
          <div className="docs-warning"><FileCode2 size={20} /><div><b>Public Testnet status</b><p>RPC, WebSocket, explorer and Rabbit Core downloads are live. The faucet remains planned with no official endpoint.</p></div></div>
        </article>
      </div>
    </main>
  )
}
