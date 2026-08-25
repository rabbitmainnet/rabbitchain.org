import { ArrowRight, Code2, Network, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'

const principles=[
  [WalletCards,'Open participation','The network is designed so participation starts with running the software and satisfying protocol rules, not asking for a private allowlist.'],
  [Network,'Independent infrastructure','Nodes, RPC services and explorers can be operated by independent participants instead of depending forever on one official server.'],
  [Code2,'Open technical surface','EVM execution, JSON-RPC, source repositories and release artifacts give builders familiar ways to inspect and integrate.'],
  [ShieldCheck,'Launch by verification','Testnet comes first so consensus, wallets, nodes and operations can be exercised publicly before Mainnet.']
]

export default function About(){return <main>
  <section className="page-hero about-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="tech">ABOUT RABBIT</StatusDot><span className="page-kicker">OPEN NETWORK · LCQ · EVM</span><h1>Build a network people can <em>join, inspect and run.</em></h1><p>Rabbit Chain is an independent EVM Layer 1 centered on LCQ Consensus, permissionless participation and a launch path that validates public infrastructure before production Mainnet.</p><div className="hero-ctas"><Link className="button primary" to="/network">Explore network <ArrowRight size={15}/></Link><a className="button secondary" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">GitHub</a></div></div><div className="about-manifesto-card"><span>RABBIT PRINCIPLE</span><strong>One wallet.<br/>One fair chance.</strong><p>A simple public idea backed by protocol work: opportunity should come from valid participation and deterministic coordination rather than permanent privilege.</p></div></div></section>

  <section className="page-section shell"><SectionHeader eyebrow="DESIGN PRINCIPLES" title="The project should explain what it is trying to preserve."/><div className="about-principle-grid">{principles.map(([Icon,title,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>

  <section className="about-sequence"><div className="shell"><SectionHeader eyebrow="LAUNCH PHILOSOPHY" title="Public validation before production value."/><div className="about-sequence-grid"><article><span>01</span><h3>Build & audit</h3><p>Finalize protocol behavior, software and network configuration.</p></article><article><span>02</span><h3>Open Testnet</h3><p>Let independent miners, nodes, wallets and developers exercise the network.</p></article><article><span>03</span><h3>Harden operations</h3><p>Validate recovery, releases, infrastructure and user tooling under public use.</p></article><article><span>04</span><h3>Launch Mainnet</h3><p>Start production from deliberately finalized genesis and release artifacts.</p></article></div></div></section>

  <section className="page-section shell"><div className="about-community-grid"><div><Users/><span>PUBLIC PROJECT</span><h2>Rabbit should be understandable without private context.</h2><p>The website, documentation, source code, status and release center are designed to turn internal project knowledge into public, verifiable information.</p></div><div><Link to="/docs">Documentation <ArrowRight size={14}/></Link><Link to="/security">Security center <ArrowRight size={14}/></Link><Link to="/releases">Release center <ArrowRight size={14}/></Link><Link to="/community">Community <ArrowRight size={14}/></Link></div></div></section>
</main>}
