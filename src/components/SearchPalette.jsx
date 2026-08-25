import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const items = [
  ['Rabbit Testnet','First public launch, Chain ID 9280','/testnet'],
  ['LCQ Consensus','How Rabbit coordinates block production','/lcq'],
  ['Mining','Download, verify and participate','/mining'],
  ['Run a Node','P2P and infrastructure path','/nodes'],
  ['Developers','EVM, JSON-RPC and tooling','/developers'],
  ['Rabbit Mainnet','Production network after Testnet','/mainnet'],
  ['Documentation','Architecture and network references','/docs'],
  ['Whitepaper','Technical Rabbit Chain paper in preparation','/whitepaper'],
  ['Community','GitHub, X and contribution','/community']
]

export default function SearchPalette({ open, onClose }){
  const [q,setQ]=useState('')
  const navigate=useNavigate()
  useEffect(()=>{if(open)setQ('')},[open])
  const results=useMemo(()=>items.filter(([a,b])=>(a+' '+b).toLowerCase().includes(q.toLowerCase())),[q])
  if(!open)return null
  return <div className="search-backdrop" onMouseDown={onClose}><div className="search-palette" onMouseDown={(e)=>e.stopPropagation()}><div className="search-input"><Search size={18}/><input autoFocus placeholder="Search Rabbit Chain…" value={q} onChange={(e)=>setQ(e.target.value)}/><button onClick={onClose}><X size={17}/></button></div><div className="search-results">{results.map(([title,text,to])=><button key={to} onClick={()=>{onClose();navigate(to)}}><span><b>{title}</b><small>{text}</small></span><em>↵</em></button>)}</div><div className="search-help">Navigate Rabbit without leaving the site.</div></div></div>
}
