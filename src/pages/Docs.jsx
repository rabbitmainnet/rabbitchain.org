import { useState } from 'react'

const sections = {
  'Introduction': ['Rabbit Chain', 'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. The public documentation will separate protocol facts from launch status so preview information is never confused with a live endpoint.'],
  'LCQ Consensus': ['Live Consensus Queue', 'LCQ coordinates eligible participants into deterministic producer opportunity. Mining, eligibility, queue ordering, producer selection, committee participation, fallback and recovery are documented as separate concepts.'],
  'Rabbit Testnet': ['Rabbit Testnet', 'Chain ID 9280. Native asset RAB. Public RPC, explorer and faucet endpoints are reserved and should only be marked live once public validation is complete.'],
  'Rabbit Mainnet': ['Rabbit Mainnet', 'Chain ID 928. Native asset RAB. Mainnet remains a prepared configuration until the production launch is explicitly activated.'],
  'Run a Node': ['Run a Rabbit node', 'The node guide will contain installation, initialization, P2P, RPC, logs, upgrades, backup and troubleshooting instructions.'],
  'Mining': ['Mining Rabbit', 'The mining guide explains client setup, wallet identity, work generation, LCQ eligibility and how producer opportunity is observed.'],
  'Developers': ['Build on Rabbit', 'Developer documentation covers EVM execution, JSON-RPC, wallet network configuration, Solidity workflows and application integration.']
}

export default function Docs() {
  const [active,setActive]=useState('Introduction')
  const [title,text]=sections[active]
  return <div className="docs-layout"><aside><span className="eyebrow">RABBIT DOCS</span><h2>Documentation</h2>{Object.keys(sections).map((s)=><button key={s} className={active===s?'active':''} onClick={()=>setActive(s)}>{s}<span>›</span></button>)}</aside><main><span className="eyebrow">{active.toUpperCase()}</span><h1>{title}</h1><p>{text}</p><div className="docs-note"><b>Preview documentation</b><p>This website structure is ready for the official technical content. Network endpoints remain explicitly marked as preview until activation.</p></div></main></div>
}
