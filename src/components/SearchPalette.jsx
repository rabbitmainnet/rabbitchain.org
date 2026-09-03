import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const items = [
  ['Rabbit Platform', 'Live Testnet Swap, Liquidity and Faucet plus upcoming platform modules', '/platform'],
  ['Rabbit Testnet', 'First public network · Chain ID 9280', '/testnet'],
  ['Rabbit Swap', 'Testnet Beta · tRAB, tWRAB and tRUSD', '/platform/swap'],
  ['Liquidity', 'Testnet Beta · create and manage RabbitSwap pools', '/platform/liquidity'],
  ['Token Factory', 'Testnet Beta · fixed-supply ERC-20 creation with TWAP pricing', '/platform/factory'],
  ['Testnet Faucet', 'Participant faucet for tRAB and tRUSD test assets', '/platform/faucet'],
  ['Network Status', 'Live RPC, WebSocket, explorer and faucet services', '/status'],
  ['LCQ Consensus', 'Work, eligibility and producer coordination', '/lcq'],
  ['Mining', 'Download, verify and participate', '/mining'],
  ['Run a Node', 'P2P and independent infrastructure', '/nodes'],
  ['Developers', 'EVM, JSON-RPC and tooling', '/developers'],
  ['Rabbit Mainnet', 'Production network after public validation', '/mainnet'],
  ['RAB / tRAB', 'Mainnet and Testnet native assets', '/rab'],
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
