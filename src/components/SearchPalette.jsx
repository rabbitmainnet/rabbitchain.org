import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const items = [
  ['Network Overview','Architecture, Testnet/Mainnet and participation','/network'],
  ['Rabbit Testnet','First public network, Chain ID 9280','/testnet'],
  ['Network Status','Official RPC, explorer and faucet readiness','/status'],
  ['LCQ Consensus','How Rabbit coordinates block production','/lcq'],
  ['RAB Native Asset','Gas, protocol rewards and network utility','/rab'],
  ['Rabbit Platform','Swap, Launchpool, Factory, Bridge and wallet tools','/platform'],
  ['Ecosystem','Official services, apps, infrastructure and community','/ecosystem'],
  ['Mining','Download, verify and participate','/mining'],
  ['Run a Node','P2P and infrastructure path','/nodes'],
  ['Developers','EVM, JSON-RPC and tooling','/developers'],
  ['Official Releases','Binaries, versions and checksums','/releases'],
  ['Security Center','Wallet safety, trusted domains and release verification','/security'],
  ['Rabbit Mainnet','Production network after public validation','/mainnet'],
  ['Documentation','Architecture, wallets, RPC and operator reference','/docs'],
  ['Whitepaper','Official Rabbit Chain protocol paper','/whitepaper'],
  ['Community','GitHub, X and contribution','/community'],
  ['About Rabbit','Mission, principles and launch philosophy','/about']
]

export default function SearchPalette({ open, onClose }){
  const [q,setQ]=useState('')
  const navigate=useNavigate()
  useEffect(()=>{if(open)setQ('')},[open])
  const results=useMemo(()=>items.filter(([a,b])=>(a+' '+b).toLowerCase().includes(q.toLowerCase())),[q])
  if(!open)return null
  return <div className="search-backdrop" onMouseDown={onClose}><div className="search-palette" onMouseDown={(e)=>e.stopPropagation()}><div className="search-input"><Search size={18}/><input autoFocus placeholder="Search Rabbit Chain…" value={q} onChange={(e)=>setQ(e.target.value)}/><button onClick={onClose}><X size={17}/></button></div><div className="search-results">{results.map(([title,text,to])=><button key={to} onClick={()=>{onClose();navigate(to)}}><span><b>{title}</b><small>{text}</small></span><em>↵</em></button>)}</div><div className="search-help">{results.length} route{results.length===1?'':'s'} · Navigate without leaving RabbitChain.org.</div></div></div>
}
