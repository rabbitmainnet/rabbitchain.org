import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import Brand from './Brand'

const cols = [
  ['Network',[['Overview','/network'],['Testnet','/testnet'],['Mining','/mining'],['Run a Node','/nodes'],['Status','/status'],['Mainnet','/mainnet']]],
  ['Technology',[['LCQ Consensus','/lcq'],['RAB Native Asset','/rab'],['Security','/security'],['Whitepaper','/whitepaper']]],
  ['Build',[['Developers','/developers'],['Documentation','/docs'],['Releases','/releases'],['GitHub','https://github.com/rabbitmainnet']]],
  ['Explore',[['Platform','/platform'],['Ecosystem','/ecosystem'],['Community','/community'],['About','/about']]],
  ['Legal',[['Privacy Policy','/privacy-policy'],['Terms & Conditions','/terms-and-conditions'],['Risk Disclosure','/risk-disclosure']]]
]

export default function Footer(){return <footer className="site-footer rc7-footer">
  <div className="shell rc7-footer-lead"><div><span>RABBIT CHAIN</span><h2>Open participation.<br/>Protocol-defined coordination.</h2></div><Link to="/testnet">Enter Rabbit Testnet <ArrowUpRight size={16}/></Link></div>
  <div className="footer-main rc7-footer-main"><div className="footer-brand"><Brand/><p>Permissionless EVM Layer 1 powered by LCQ Consensus.</p><strong>One wallet. One fair chance.</strong><div className="footer-verify"><ShieldCheck size={16}/><div><span>OFFICIAL DOMAIN</span><b>rabbitchain.org</b></div></div></div>{cols.map(([title,items])=><div className="footer-col" key={title}><span>{title}</span>{items.map(([label,to])=>to.startsWith('http')?<a key={label} href={to} target="_blank" rel="noreferrer">{label}</a>:<Link key={label} to={to}>{label}</Link>)}</div>)}</div>
  <div className="footer-bottom rc7-footer-bottom"><span>© 2026 Rabbit Chain</span><span>Testnet 9280 · Mainnet 928</span><span>LCQ · EVM · P2P</span><a href="https://x.com/rabbit_mainnet" target="_blank" rel="noreferrer">@rabbit_mainnet</a></div>
</footer>}
