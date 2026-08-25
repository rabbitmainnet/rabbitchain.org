import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Code2, Menu, Search, Wallet, X } from 'lucide-react'
import Brand from './Brand'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

const groups = [
  { label:'Network', links:[['Rabbit Testnet','/testnet'],['Network Status','/status'],['Mining','/mining'],['Run a Node','/nodes'],['Rabbit Mainnet','/mainnet']] },
  { label:'Technology', links:[['LCQ Consensus','/lcq'],['Architecture','/lcq#architecture'],['Reward Model','/lcq#rewards'],['Whitepaper','/whitepaper']] },
  { label:'Build', links:[['Developer Portal','/developers'],['Documentation','/docs'],['Network Parameters','/developers#networks'],['JSON-RPC','/developers#rpc']] },
]

export default function Header({ walletState, onWalletClick, onOpenSearch }) {
  const [open,setOpen]=useState(null)
  const [mobile,setMobile]=useState(false)
  const location=useLocation()
  const activeNetwork=identifyRabbitNetwork(walletState.chainId)
  useEffect(()=>{setOpen(null);setMobile(false)},[location.pathname])
  return <>
    <div className="announcement"><div><span><i/>RABBIT TESTNET · FIRST PUBLIC LAUNCH · CHAIN ID 9280</span><b>Official launch path</b><Link to="/status">Network status →</Link></div></div>
    <header className="site-header"><div className="header-shell">
      <Brand/>
      <nav className="desktop-nav">
        {groups.map((group)=><div className="nav-group" key={group.label}><button onClick={()=>setOpen(open===group.label?null:group.label)}>{group.label}<ChevronDown size={13}/></button>{open===group.label&&<div className="mega-menu"><span className="mega-label">{group.label.toUpperCase()}</span>{group.links.map(([label,to])=><Link key={label} to={to}>{label}<span>→</span></Link>)}</div>}</div>)}
        <NavLink to="/platform">Platform</NavLink>
        <NavLink to="/community">Community</NavLink>
      </nav>
      <div className="header-actions">
        <button className="search-button" onClick={onOpenSearch}><Search size={15}/><span>Search</span><kbd>⌘K</kbd></button>
        <a className="icon-button" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={17}/></a>
        <button className={`wallet-button ${walletState.account?'connected':''}`} onClick={onWalletClick}>
          {walletState.account?<span className="wallet-connected-dot"/>:<Wallet size={15}/>} 
          <span className="wallet-button-copy">{walletState.account?shortAddress(walletState.account):'Connect wallet'}</span>
          {walletState.account&&<small>{activeNetwork?.shortName || 'Wallet'}</small>}
          {walletState.account&&<ChevronDown size={13}/>} 
        </button>
        <button className="mobile-button" onClick={()=>setMobile(!mobile)}>{mobile?<X size={18}/>:<Menu size={18}/>}</button>
      </div>
    </div></header>
    {mobile&&<div className="mobile-nav"><Link to="/testnet">Testnet</Link><Link to="/status">Network Status</Link><Link to="/platform">Platform</Link><Link to="/lcq">LCQ Consensus</Link><Link to="/mining">Mining</Link><Link to="/nodes">Run a Node</Link><Link to="/developers">Developers</Link><Link to="/mainnet">Mainnet</Link><Link to="/docs">Docs</Link><Link to="/whitepaper">Whitepaper</Link><Link to="/community">Community</Link><button onClick={()=>{setMobile(false);onWalletClick()}}>{walletState.account?`Wallet · ${shortAddress(walletState.account)}`:'Connect wallet'}</button></div>}
  </>
}
