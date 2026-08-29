import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const items = [
  ['Rabbit Platform', 'Swap, liquidity, staking, bridge, P2P, launchpool, token factory and Testnet faucet', '/platform'],
  ['Rabbit Testnet', 'First public network · Chain ID 9280', '/testnet'],
  ['Network Status', 'Official RPC, explorer and faucet readiness', '/status'],
  ['LCQ Consensus', 'Work, eligibility and producer coordination', '/lcq'],
  ['Mining', 'Download, verify and participate', '/mining'],
  ['Run a Node', 'P2P and independent infrastructure', '/nodes'],
  ['Developers', 'EVM, JSON-RPC and tooling', '/developers'],
  ['Rabbit Mainnet', 'Production network after public validation', '/mainnet'],
  ['RAB', 'Native asset and reward role', '/rab'],
  ['Security', 'Official domains, wallets and release verification', '/security'],
  ['Releases', 'Official Rabbit binaries', '/releases'],
  ['Documentation', 'Protocol and network references', '/docs'],
  ['Whitepaper', 'Official Rabbit Chain protocol paper', '/whitepaper'],
  ['Community', 'GitHub, X, Discord and participation', '/community'],
  ['About', 'Rabbit Chain project principles', '/about'],
]

export default function SearchPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  useEffect(() => { if (open) setQuery('') }, [open])
  const results = useMemo(() => items.filter(([title, text]) => `${title} ${text}`.toLowerCase().includes(query.toLowerCase())), [query])
  if (!open) return null
  return (
    <div className="search-backdrop" onMouseDown={onClose}>
      <div className="search-palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="search-input"><Search size={18} /><input autoFocus placeholder="Search Rabbit Chain…" value={query} onChange={(event) => setQuery(event.target.value)} /><button onClick={onClose}><X size={17} /></button></div>
        <div className="search-results">{results.map(([title, text, to]) => <button key={to} onClick={() => { onClose(); navigate(to) }}><span><b>{title}</b><small>{text}</small></span><em>↵</em></button>)}</div>
        <div className="search-help">Search the official network, protocol, platform and documentation.</div>
      </div>
    </div>
  )
}
