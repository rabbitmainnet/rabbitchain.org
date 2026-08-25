import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X, Wallet, ArrowUpRight } from 'lucide-react'
import Brand from './Brand'
import { shortAddress } from '../lib/wallet'

const groups = [
  { label: 'Mainnet', links: [['Mainnet overview','/network?network=mainnet'],['LCQ Consensus','/lcq'],['Network architecture','/lcq#architecture']] },
  { label: 'Testnet', links: [['Public testnet','/network?network=testnet'],['Faucet','/network?network=testnet'],['Explorer','/network?network=testnet']] },
  { label: 'Participate', links: [['Start mining','/mining'],['Run a node','/mining#node'],['Downloads','/mining#downloads']] },
  { label: 'Developers', links: [['Developer portal','/developers'],['JSON-RPC','/developers#rpc'],['GitHub','https://github.com/rabbitmainnet']] }
]

export default function Header({ walletState, onWalletClick }) {
  const [open,setOpen]=useState(null)
  const [mobile,setMobile]=useState(false)
  return <header className="site-header">
    <div className="header-shell">
      <Brand />
      <nav className="desktop-nav">
        {groups.map(group=><div className="nav-group" key={group.label} onMouseEnter={()=>setOpen(group.label)} onMouseLeave={()=>setOpen(null)}>
          <button>{group.label}<ChevronDown size={12}/></button>
          {open===group.label&&<div className="mega-menu">
            <div className="mega-label">{group.label}</div>
            {group.links.map(([label,href])=>href.startsWith('http')?<a href={href} key={label} target="_blank" rel="noreferrer"><span>{label}</span><ArrowUpRight size={13}/></a>:<Link to={href} key={label}><span>{label}</span><ArrowUpRight size={13}/></Link>)}
          </div>}
        </div>)}
        <NavLink to="/docs">Docs</NavLink>
      </nav>
      <div className="header-actions">
        <Link className="mainnet-status" to="/network?network=mainnet"><i/>MAINNET · COMING SOON</Link>
        <button className="wallet-button" onClick={onWalletClick}><Wallet size={15}/>{walletState.account?shortAddress(walletState.account):'CONNECT WALLET'}</button>
        <button className="mobile-menu-btn" onClick={()=>setMobile(!mobile)} aria-label="Toggle menu">{mobile?<X/>:<Menu/>}</button>
      </div>
    </div>
    {mobile&&<div className="mobile-nav">
      <Link onClick={()=>setMobile(false)} to="/network?network=mainnet"><b>Rabbit Mainnet</b><span>COMING SOON</span></Link>
      <Link onClick={()=>setMobile(false)} to="/network?network=testnet">Rabbit Testnet<span>PRE-LAUNCH</span></Link>
      <Link onClick={()=>setMobile(false)} to="/lcq">LCQ Consensus<span>↗</span></Link>
      <Link onClick={()=>setMobile(false)} to="/mining">Mining & Nodes<span>↗</span></Link>
      <Link onClick={()=>setMobile(false)} to="/developers">Developers<span>↗</span></Link>
      <Link onClick={()=>setMobile(false)} to="/docs">Docs<span>↗</span></Link>
    </div>}
  </header>
}
