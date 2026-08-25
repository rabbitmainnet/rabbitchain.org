import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Code2, Menu, Search, Wallet, X } from 'lucide-react'
import Brand from './Brand'
import { shortAddress } from '../lib/wallet'

const groups = [
  { label:'Learn', links:[['LCQ Consensus','/lcq'],['Rabbit architecture','/lcq#architecture'],['Mainnet roadmap','/mainnet'],['Documentation','/docs']] },
  { label:'Network', links:[['Rabbit Testnet','/testnet'],['Rabbit Mainnet','/mainnet'],['Run a node','/nodes'],['Mining','/mining']] },
  { label:'Build', links:[['Developer portal','/developers'],['Network parameters','/developers#networks'],['JSON-RPC','/developers#rpc'],['GitHub','https://github.com/rabbitmainnet']] }
]

export default function Header({ walletState, onWalletClick, onOpenSearch }) {
  const [open,setOpen]=useState(null)
  const [mobile,setMobile]=useState(false)
  const location=useLocation()
  const navigate=useNavigate()
  useEffect(()=>{setOpen(null);setMobile(false)},[location.pathname])
  return <>
    <div className="announcement"><div><span><i/>PUBLIC TESTNET IS THE FIRST LAUNCH</span><b>Chain ID 9280</b><Link to="/testnet">Follow launch readiness →</Link></div></div>
    <header className="site-header"><div className="header-shell">
      <Brand/>
      <nav className="desktop-nav">
        <NavLink to="/testnet">Testnet</NavLink>
        {groups.map((group)=><div className="nav-group" key={group.label}><button onClick={()=>setOpen(open===group.label?null:group.label)}>{group.label}<ChevronDown size={13}/></button>{open===group.label&&<div className="mega-menu"><span className="mega-label">{group.label.toUpperCase()}</span>{group.links.map(([label,to])=>to.startsWith('http')?<a key={label} href={to} target="_blank" rel="noreferrer">{label}<span>↗</span></a>:<Link key={label} to={to}>{label}<span>→</span></Link>)}</div>}</div>)}
        <NavLink to="/community">Community</NavLink>
      </nav>
      <div className="header-actions">
        <button className="search-button" onClick={onOpenSearch}><Search size={15}/><span>Search</span><kbd>⌘K</kbd></button>
        <a className="icon-button" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={17}/></a>
        <button className="wallet-button" onClick={onWalletClick}><Wallet size={15}/><span>{walletState.account?shortAddress(walletState.account):'Connect wallet'}</span></button>
        <button className="mobile-button" onClick={()=>setMobile(!mobile)}>{mobile?<X size={18}/>:<Menu size={18}/>}</button>
      </div>
    </div></header>
    {mobile&&<div className="mobile-nav"><Link to="/testnet">Testnet</Link><Link to="/lcq">LCQ Consensus</Link><Link to="/mining">Mining</Link><Link to="/nodes">Run a Node</Link><Link to="/developers">Developers</Link><Link to="/mainnet">Mainnet</Link><Link to="/docs">Docs</Link><Link to="/community">Community</Link><button onClick={()=>{setMobile(false);onWalletClick()}}>Connect wallet</button></div>}
  </>
}
