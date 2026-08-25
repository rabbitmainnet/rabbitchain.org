import { Link } from 'react-router-dom'
import Brand from './Brand'

const cols = [
  ['Network',[['Testnet','/testnet'],['Mainnet','/mainnet'],['Mining','/mining'],['Run a Node','/nodes']]],
  ['Technology',[['LCQ Consensus','/lcq'],['Architecture','/lcq#architecture'],['Reward Model','/lcq#rewards'],['Roadmap','/mainnet']]],
  ['Build',[['Developers','/developers'],['Docs','/docs'],['Whitepaper','/whitepaper'],['JSON-RPC','/developers#rpc'],['GitHub','https://github.com/rabbitmainnet']]],
  ['Community',[['X / Twitter','https://x.com/rabbit_mainnet'],['GitHub','https://github.com/rabbitmainnet'],['Contribute','/community'],['Security','/community#security']]]
]

export default function Footer(){
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Brand/><p>Permissionless EVM Layer 1 powered by LCQ Consensus.</p><strong>One wallet. One fair chance.</strong></div>{cols.map(([title,items])=><div className="footer-col" key={title}><span>{title}</span>{items.map(([label,to])=>to.startsWith('http')?<a key={label} href={to} target="_blank" rel="noreferrer">{label}</a>:<Link key={label} to={to}>{label}</Link>)}</div>)}</div><div className="footer-bottom"><span>© 2026 Rabbit Chain</span><span>Testnet launches first · Mainnet follows validation</span><span>Open infrastructure · No seed phrase requested</span></div></footer>
}
