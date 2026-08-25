import { ArrowRight, Blocks, BookOpen, Code2, Cpu, Factory, FlaskConical, Globe2, Layers3, Network, Repeat2, ShieldCheck, Wallet, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'
import { NETWORKS } from '../config/networks'

const appModules=[
  [Repeat2,'Swap','Trading','ROADMAP'],[Waves,'Liquidity','DeFi','ROADMAP'],[Layers3,'Launchpool','Launch','ROADMAP'],[Factory,'Token Factory','Build','ROADMAP'],[Blocks,'Bridge','Interop','ROADMAP'],[Wallet,'Portfolio','Wallet','ROADMAP']
]

export default function Ecosystem(){
  const t=NETWORKS.testnet
  const services=[
    [Wallet,'Wallet Portal','Connect browser wallets and WalletConnect.','LIVE','/'],
    [BookOpen,'Documentation','Official network and protocol reference.','LIVE','/docs'],
    [Code2,'Source Code','Public Rabbit repositories and website history.','LIVE','https://github.com/rabbitmainnet'],
    [Network,'Testnet RPC',t.rpcUrl,t.publicRpcReady?'LIVE':'RESERVED','/status'],
    [Globe2,'Explorer',t.explorerUrl,t.publicExplorerReady?'LIVE':'RESERVED','/status'],
    [FlaskConical,'Faucet',t.faucetUrl,t.publicFaucetReady?'LIVE':'RESERVED','/status']
  ]
  return <main>
    <section className="page-hero ecosystem-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="tech">RABBIT ECOSYSTEM</StatusDot><span className="page-kicker">NETWORK · APPS · INFRASTRUCTURE</span><h1>Everything around Rabbit, <em>without fake listings.</em></h1><p>The ecosystem directory starts with official network surfaces and clearly labeled roadmap modules. Third-party projects should appear only after they actually exist and can be verified.</p><div className="hero-ctas"><Link className="button primary" to="/platform">Open Platform <ArrowRight size={15}/></Link><Link className="button secondary" to="/developers">Build on Rabbit</Link></div></div><div className="ecosystem-map-card"><div className="eco-node core"><img src="/rabbit-mark.png" alt=""/><strong>RABBIT</strong></div><div className="eco-node n1">WALLETS</div><div className="eco-node n2">NODES</div><div className="eco-node n3">BUILDERS</div><div className="eco-node n4">APPS</div><div className="eco-node n5">MINERS</div><div className="eco-node n6">TOOLS</div></div></div></section>

    <section className="page-section shell"><SectionHeader eyebrow="OFFICIAL SURFACES" title="What exists, what is reserved and what is still roadmap." text="This status-first directory keeps visitors from confusing a planned service with a live one."/><div className="ecosystem-service-grid">{services.map(([Icon,title,text,status,to])=>{const external=String(to).startsWith('http');const body=<><div><Icon/><StatusDot tone={status==='LIVE'?'launch':undefined}>{status}</StatusDot></div><h3>{title}</h3><p>{text}</p><b>Open <ArrowRight size={14}/></b></>;return external?<a key={title} href={to} target="_blank" rel="noreferrer">{body}</a>:<Link key={title} to={to}>{body}</Link>})}</div></section>

    <section className="ecosystem-apps"><div className="shell"><SectionHeader eyebrow="APPLICATION LAYER" title="A complete platform map before every module is live." text="Roadmap status is a feature: users should know what can be used today."/><div className="ecosystem-app-grid">{appModules.map(([Icon,title,category,status])=><article key={title}><Icon/><span>{category}</span><h3>{title}</h3><StatusDot>{status}</StatusDot></article>)}</div><Link className="button primary" to="/platform">Explore Rabbit Platform <ArrowRight size={15}/></Link></div></section>

    <section className="page-section shell"><SectionHeader eyebrow="NETWORK PARTICIPANTS" title="The ecosystem is more than applications."/><div className="portal-route-grid"><Link to="/mining"><Cpu/><span>MINERS</span><h3>Produce valid work</h3><p>Participate in LCQ under public protocol rules.</p><b>Mining portal →</b></Link><Link to="/nodes"><Network/><span>OPERATORS</span><h3>Run independent nodes</h3><p>Sync, relay, expose RPC or index the chain.</p><b>Node guide →</b></Link><Link to="/developers"><Code2/><span>BUILDERS</span><h3>Build EVM applications</h3><p>Use familiar contract and JSON-RPC tooling.</p><b>Developer portal →</b></Link><Link to="/security"><ShieldCheck/><span>SECURITY</span><h3>Verify official surfaces</h3><p>Check domains, releases and network status.</p><b>Security center →</b></Link></div></section>

    <section className="community-callout"><div className="shell"><span>COMMUNITY PROJECTS</span><h2>A public directory should grow from real deployments.</h2><p>Rabbit can add a submission and verification process after Testnet is public. Until then, the portal avoids manufacturing partner logos or claiming integrations that do not exist.</p><Link to="/community">Community channels <ArrowRight size={15}/></Link></div></section>
  </main>
}
