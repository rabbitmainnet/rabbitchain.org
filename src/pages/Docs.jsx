import { useState } from 'react'

const sections = {
  'Introduction': ['Rabbit Chain', 'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. The portal treats Rabbit Mainnet as the flagship network and Rabbit Testnet as the public validation environment that comes first.'],
  'Rabbit Mainnet': ['Rabbit Mainnet', 'Chain ID 928. Native asset RAB. Mainnet is the primary production network in the Rabbit portal. RPC and explorer endpoints remain reserved until the production launch is explicitly activated.'],
  'Rabbit Testnet': ['Rabbit Testnet', 'Chain ID 9280. Native asset RAB. Testnet is the public launch environment for validating client releases, mining, node operation, wallets, RPC, explorer, faucet and application integrations before mainnet.'],
  'LCQ Consensus': ['Live Consensus Queue', 'LCQ coordinates eligible participants into deterministic producer opportunity. Mining, eligibility, queue ordering, producer selection, committee participation, fallback and recovery are documented as separate concepts.'],
  'Run a Node': ['Run a Rabbit node', 'The node guide will contain installation, initialization, network selection, P2P, RPC, logs, upgrades, backup and troubleshooting instructions.'],
  'Mining': ['Mining Rabbit', 'The mining guide explains client setup, wallet identity, work generation, LCQ eligibility and how producer opportunity is observed on Testnet and Mainnet.'],
  'Developers': ['Build on Rabbit', 'Developer documentation covers EVM execution, JSON-RPC, wallet network configuration, Solidity workflows and application integration for both Rabbit networks.']
}

export default function Docs() {
  const [active,setActive]=useState('Introduction')
  const [title,text]=sections[active]
  return <div className="docs-layout"><aside><span className="eyebrow">RABBIT DOCS</span><h2>Documentation</h2>{Object.keys(sections).map((s)=><button key={s} className={active===s?'active':''} onClick={()=>setActive(s)}>{s}<span>›</span></button>)}</aside><main><span className="eyebrow">{active.toUpperCase()}</span><h1>{title}</h1><p>{text}</p><div className="docs-note"><b>Launch-state documentation</b><p>Reserved endpoints remain explicitly marked as inactive until the corresponding public service is actually enabled.</p></div></main></div>
}
