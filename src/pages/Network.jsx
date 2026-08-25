import { Activity, ArrowRight, Blocks, Code2, Cpu, Globe2, Network as NetworkIcon, Radio, ShieldCheck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'
import NetworkPulse from '../components/NetworkPulse'
import { NETWORKS } from '../config/networks'

const stack=[
  ['APPLICATIONS','Wallets · contracts · dApps · explorers',Globe2],
  ['EXECUTION','EVM · state · transactions · JSON-RPC',Code2],
  ['CONSENSUS','Work · eligibility · LCQ · producer · committee',Cpu],
  ['NETWORK','Permissionless P2P · independent nodes',NetworkIcon]
]

export default function Network(){
  const t=NETWORKS.testnet
  const m=NETWORKS.mainnet
  return <main>
    <section className="page-hero network-overview-hero"><div className="shell page-hero-grid"><div><StatusDot tone="tech">RABBIT NETWORK</StatusDot><span className="page-kicker">PROTOCOL · EXECUTION · P2P</span><h1>One protocol.<br/><em>Two network stages.</em></h1><p>Rabbit Chain combines EVM execution with LCQ Consensus and a permissionless P2P network. Testnet is the public proving ground; Mainnet follows validated operation.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Enter Testnet <ArrowRight size={15}/></Link><Link className="button secondary" to="/lcq">How LCQ works</Link></div></div><div className="network-stage-card"><div className="stage-row active"><span>01</span><div><small>FIRST PUBLIC NETWORK</small><strong>Rabbit Testnet</strong><em>Chain ID 9280 · 0x2440</em></div><StatusDot tone="launch">{t.status}</StatusDot></div><div className="stage-link"/><div className="stage-row"><span>02</span><div><small>PRODUCTION NETWORK</small><strong>Rabbit Mainnet</strong><em>Chain ID 928 · 0x3a0</em></div><StatusDot tone="future">{m.status}</StatusDot></div></div></div></section>

    <section className="page-section shell"><SectionHeader eyebrow="NETWORK AT A GLANCE" title="The chain identity should be obvious in seconds." text="The same facts appear consistently across wallet setup, developer docs and network operations."/><div className="network-facts-grid"><article><Radio/><span>TESTNET</span><strong>9280</strong><p>First public network and default environment for launch validation.</p></article><article><Blocks/><span>MAINNET</span><strong>928</strong><p>Reserved production identity, activated only after Testnet release gates.</p></article><article><Cpu/><span>CONSENSUS</span><strong>LCQ</strong><p>Protocol-defined coordination for eligible producer opportunities.</p></article><article><Code2/><span>EXECUTION</span><strong>EVM</strong><p>Ethereum-compatible execution and familiar developer tooling.</p></article><article><Activity/><span>BLOCK TARGET</span><strong>~10s</strong><p>Target cadence defined by Rabbit network parameters.</p></article><article><NetworkIcon/><span>TOPOLOGY</span><strong>P2P</strong><p>Independent nodes discover peers and propagate chain data.</p></article></div></section>

    <section className="network-stack-section"><div className="shell"><SectionHeader eyebrow="PROTOCOL STACK" title="Applications stay familiar. Consensus is where Rabbit differs." text="The architecture keeps user and developer interfaces recognizable while LCQ sits beneath EVM execution."/><div className="network-stack-grid">{stack.map(([label,text,Icon],i)=><article key={label} className={label==='CONSENSUS'?'accent':''}><div><span>{String(i+1).padStart(2,'0')}</span><Icon size={20}/></div><small>{label}</small><strong>{text}</strong></article>)}</div></div></section>

    <section className="page-section shell"><NetworkPulse/></section>

    <section className="page-section shell"><SectionHeader eyebrow="PARTICIPATE" title="Use Rabbit without depending on one kind of participant." text="Users, miners, node operators and builders each have a direct entry point."/><div className="portal-route-grid"><Link to="/testnet"><Wallet/><span>USE</span><h3>Connect a wallet</h3><p>WalletConnect, browser wallets and Rabbit Testnet network setup.</p><b>Open Testnet →</b></Link><Link to="/mining"><Cpu/><span>MINE</span><h3>Participate in LCQ</h3><p>Official releases, verification and mining workflow.</p><b>Mining portal →</b></Link><Link to="/nodes"><NetworkIcon/><span>OPERATE</span><h3>Run infrastructure</h3><p>Full nodes, RPC nodes, archive/indexer and P2P operation.</p><b>Node guide →</b></Link><Link to="/developers"><Code2/><span>BUILD</span><h3>Deploy EVM apps</h3><p>Network parameters, JSON-RPC and contract tooling.</p><b>Developer portal →</b></Link></div></section>

    <section className="security-strip"><div className="shell security-strip-grid"><ShieldCheck size={29}/><div><span>VERIFY THE NETWORK</span><h2>Official endpoints, releases and status live in one portal.</h2><p>Rabbit does not require a seed phrase to connect a wallet. Public services remain marked Reserved until intentionally activated.</p></div><Link to="/security">Security center <ArrowRight size={15}/></Link></div></section>
  </main>
}
