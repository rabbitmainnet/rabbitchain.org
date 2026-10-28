import { useMemo, useState } from 'react'
import { BookOpen, ChevronRight, Code2, Cpu, FileCheck2, FileCode2, Network, Search, ShieldCheck, Wallet } from 'lucide-react'
import { NETWORKS } from '../config/networks'

const sections = [
  { id: 'overview', title: 'Overview', icon: BookOpen, body: [['Rabbit Chain', 'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. Rabbit Testnet is live; Mainnet follows public validation.'], ['Core principle', 'One wallet. One fair chance. Work V2 provides permissionless admission into one persistent equal seat, while LCQ coordinates producer opportunities.']] },
  { id: 'testnet', title: 'Rabbit Testnet', icon: Network, body: [['Purpose', 'The first public network for miners, nodes, wallets, applications and infrastructure.'], ['Chain ID', '9280 (0x2440)'], ['Native asset', 'tRAB (testnet only; no guaranteed monetary value).'], ['Status', 'Live with public P2P, HTTPS RPC, WebSocket RPC, explorer and the official participant tRAB + tRUSD faucet (10 tRAB or 1,000 tRUSD per claim, 24-hour cooldown).']] },
  { id: 'mainnet', title: 'Rabbit Mainnet', icon: Network, body: [['Purpose', 'The production Rabbit network that launches after successful Testnet validation.'], ['Chain ID', '928 (0x3a0)'], ['Native asset', 'RAB'], ['Status', 'Not launched. Production endpoints remain reserved.']] },
  { id: 'lcq', title: 'LCQ Consensus', icon: Cpu, body: [['Flow', 'Work V2 admission → LCQ PENDING → persistent equal seat / LCQ ACTIVE → Producer / Committee.'], ['Reward model', '70% producer / 30% eligible committee. V5-header settlement is corrected from block 153,601; earlier missed rewards are not automatically repaid.'], ['Execution', 'EVM execution remains separate from consensus coordination.']] },
  { id: 'fork-320000', title: 'Fork 320000 and VRF', icon: FileCheck2, body: [['Activation', 'VRF economics V2 and WorkSeat admission V2 remain active from block 320,000. WorkSeat liveness V2 has been active since block 323,800. Rabbit Core v2.4.17 adds startup schedule and VRF peer connection fixes without a new fork. Historical activation heights remain unchanged.'], ['VRF fees', 'From activation: base pricing target US$0.005 equivalent in tRUSD, paid in tRAB using the live quoteRequestFee(0). Gas is additional. At fulfillment: 50% development allocation plus integer rounding remainders, 30% equally among validated VRF signers, 20% fulfillment block producer. Mining rewards remain 70/30.'], ['Measured latency', 'Two local SSD-backed tests completed 48 requests with three concurrent clients. Early proofs were independently verified 0.176–1.242 seconds after observed inclusion. These are local measurements, not a public Testnet SLA or on-chain finality. Submission-to-inclusion time is additional.'], ['Storage and restart', 'Use reliable SSD storage for latency-sensitive VRF persistence. Keep durable writes enabled and preserve all signing and participation state. Shut down normally before maintenance.'], ['Application integration', 'The existing website fulfillment timer tracks on-chain completion. The early-proof RPC requires independent cryptographic verification and canonical request/session checks; applications must handle reorganizations and settle against canonical state.']] },
  { id: 'wallets', title: 'Wallets', icon: Wallet, body: [['Injected wallets', 'RabbitChain.org discovers compatible browser wallets through EIP-6963.'], ['WalletConnect', 'QR and remote-wallet connections use the official Rabbit WalletConnect project configuration.'], ['Network setup', 'Rabbit Testnet uses Chain ID 9280 (0x2440). Add/switch requests are sent through the wallet native EVM flow.']] },
  { id: 'rpc', title: 'Developer Reference', icon: Code2, body: [['Testnet RPC', NETWORKS.testnet.rpcUrl], ['Testnet Explorer', NETWORKS.testnet.explorerUrl], ['Testnet Faucet', NETWORKS.testnet.faucetUrl], ['Mainnet RPC', NETWORKS.mainnet.rpcUrl], ['Mainnet Explorer', NETWORKS.mainnet.explorerUrl]] },
  { id: 'releases', title: 'Releases', icon: FileCheck2, body: [['Required version', 'Rabbit Core Testnet V2.4.17 is the current public Testnet release. New installations automatically create or reuse an encrypted wallet, download and SHA-256 verify the official multipart blockchain bootstrap, resume interrupted downloads, synchronize remaining blocks and begin LCQ mining. Earlier releases isolate LCQ delivery per peer, retries failed recovery downloads and displays PENALIZED, the end block and remaining blocks. PENALTY ENDED reports expiry; synchronization and selection are still required. Operational status refreshes approximately every 10 to 12 seconds. Earlier releases added authenticated VRF relay between miners through public peers with VRF economics and WorkSeat admission active from block 320,000; WorkSeat liveness V2 has been active since block 323,800. Existing chain history, reward rules and wallets are preserved. VRF requesters do not need to mine.'], ['Upgrade safety', 'This is an in-place software upgrade. Do not delete the Rabbit Testnet datadir, blockchain data, wallet or keystore, node identity, or persistent participation / consensus state.'], ['Data storage', 'The executable folder does not determine where chain data is stored. Use rabbit-core --data-dir with an absolute path on a drive with free space. Existing users must stop Rabbit processes, copy the complete data directory and verify their existing wallet before switching paths.'], ['Mining UX', 'Rabbit Core creates or reuses the local mining wallet automatically, connects to the Rabbit P2P network, synchronizes and handles LCQ participation without manual RPC, WebSocket, peer or wallet configuration.'], ['Verification', 'Only install verified Rabbit Core V2.4.17 packages published in the official Rabbit release center and confirm the archive SHA-256 before extraction.']] },
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
          <div className="docs-warning"><FileCode2 size={20} /><div><b>Public Testnet status</b><p>RPC, WebSocket, explorer, Rabbit Core downloads and the official participant faucet are live. New wallets earn their first tRAB through mining; faucet claims are 10 tRAB or 1,000 tRUSD every 24 hours.</p></div></div>
        </article>
      </div>
    </main>
  )
}
