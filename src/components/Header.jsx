import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, Code2, Menu, Search, Wallet, X } from 'lucide-react'
import Brand from './Brand'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

const groups = [
  {
    label:'Network',
    featured:['Network overview','Understand the Rabbit protocol stack, public networks and launch path.','/network'],
    links:[['Rabbit Testnet','Chain ID 9280 · first public network','/testnet'],['Mining','Participate through LCQ','/mining'],['Run a Node','Operate independent P2P infrastructure','/nodes'],['Network Status','Verify public service availability','/status'],['Rabbit Mainnet','Production network path','/mainnet']]
  },
  {
    label:'Technology',
    featured:['LCQ Consensus','The protocol layer that coordinates producer opportunity.','/lcq'],
    links:[['LCQ Architecture','Work → eligibility → queue → producer','/lcq#architecture'],['RAB Native Asset','Gas and protocol reward asset','/rab'],['Security Center','Verify domains, wallets and releases','/security'],['Whitepaper','Protocol paper status','/whitepaper']]
  },
  {
    label:'Build',
    featured:['Developer Portal','EVM tooling, network parameters and JSON-RPC.','/developers'],
    links:[['Documentation','Technical reference and guides','/docs'],['JSON-RPC','Connect applications to Rabbit','/developers#rpc'],['Official Releases','Verified software and checksums','/releases'],['GitHub','Official source repositories','https://github.com/rabbitmainnet']]
  },
  {
    label:'Explore',
    featured:['Rabbit Platform','The wallet-connected application layer.','/platform'],
    links:[['Ecosystem','Network services and application surfaces','/ecosystem'],['Community','Official public channels','/community'],['About Rabbit','Mission and design principles','/about'],['X / Twitter','@rabbit_mainnet','https://x.com/rabbit_mainnet']]
  },
]

function NavLink({label,sub,to}){
  const external=to.startsWith('http')
  const inner=<><span><b>{label}</b><small>{sub}</small></span><ArrowUpRight size={14}/></>
  return external?<a href={to} target="_blank" rel="noreferrer">{inner}</a>:<Link to={to}>{inner}</Link>
}

export default function Header({ walletState, onWalletClick, onOpenSearch }) {
  const [open,setOpen]=useState(null)
  const [mobile,setMobile]=useState(false)
  const location=useLocation()
  const navRef=useRef(null)
  const activeNetwork=identifyRabbitNetwork(walletState.chainId)

  useEffect(()=>{setOpen(null);setMobile(false)},[location.pathname,location.hash])
  useEffect(()=>{
    const onPointer=(e)=>{if(open && navRef.current && !navRef.current.contains(e.target))setOpen(null)}
    const onKey=(e)=>{if(e.key==='Escape'){setOpen(null);setMobile(false)}}
    document.addEventListener('mousedown',onPointer)
    document.addEventListener('touchstart',onPointer)
    document.addEventListener('keydown',onKey)
    return()=>{document.removeEventListener('mousedown',onPointer);document.removeEventListener('touchstart',onPointer);document.removeEventListener('keydown',onKey)}
  },[open])
  useEffect(()=>{
    if(!mobile)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    return()=>{document.body.style.overflow=previous}
  },[mobile])

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="announcement rc7-announcement"><div><span className="notranslate" translate="no"><i/>RABBIT TESTNET · CHAIN ID 9280 · FIRST PUBLIC LAUNCH</span><Link to="/status">Launch status <ArrowUpRight size={11}/></Link></div></div>
    <header className="site-header rc7-header"><div className="header-shell">
      <Brand/>
      <nav className="desktop-nav rc7-desktop-nav" ref={navRef} aria-label="Primary navigation">
        {groups.map((group)=><div className="nav-group rc7-nav-group" key={group.label}>
          <button type="button" className={open===group.label?'nav-open':''} aria-expanded={open===group.label} aria-haspopup="true" onClick={()=>setOpen(open===group.label?null:group.label)}>{group.label}<ChevronDown size={13}/></button>
          {open===group.label&&<div className="mega-menu rc7-mega-menu">
            <Link className="rc7-mega-featured" to={group.featured[2]}><span>{group.label.toUpperCase()}</span><strong>{group.featured[0]}</strong><p>{group.featured[1]}</p><b>Open <ArrowUpRight size={14}/></b></Link>
            <div className="rc7-mega-links">{group.links.map(([label,sub,to])=><NavLink key={label} label={label} sub={sub} to={to}/>)}</div>
          </div>}
        </div>)}
        <Link className="rc7-direct-link" to="/docs">Docs</Link>
      </nav>
      <div className="header-actions">
        <button className="search-button" onClick={onOpenSearch} aria-label="Search Rabbit Chain"><Search size={15}/><span>Search</span><kbd>⌘K</kbd></button>
        <a className="icon-button" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer" aria-label="Rabbit Chain on GitHub"><Code2 size={17}/></a>
        <button className={`wallet-button ${walletState.account?'connected':''}`} onClick={onWalletClick}>
          {walletState.account?<span className="wallet-connected-dot"/>:<Wallet size={15}/>}<span className="wallet-button-copy">{walletState.account?shortAddress(walletState.account):'Connect wallet'}</span>{walletState.account&&<small>{activeNetwork?.shortName || 'Wallet'}</small>}{walletState.account&&<ChevronDown size={13}/>} 
        </button>
        <button className="mobile-button" aria-expanded={mobile} aria-label={mobile?'Close navigation':'Open navigation'} onClick={()=>setMobile(!mobile)}>{mobile?<X size={20}/>:<Menu size={20}/>}</button>
      </div>
    </div></header>
    {mobile&&<><button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={()=>setMobile(false)}/><nav className="mobile-nav rc7-mobile-nav" aria-label="Mobile navigation"><div className="mobile-nav-head"><div><span>RABBIT CHAIN</span><small>OFFICIAL NETWORK PORTAL</small></div><button onClick={()=>setMobile(false)} aria-label="Close"><X size={18}/></button></div>{groups.map(group=><div className="rc7-mobile-group" key={group.label}><span>{group.label}</span>{[group.featured,...group.links].map(([label,sub,to])=>to.startsWith('http')?<a key={label} href={to} target="_blank" rel="noreferrer"><b>{label}</b><small>{sub}</small></a>:<Link key={label} to={to}><b>{label}</b><small>{sub}</small></Link>)}</div>)}<Link to="/docs"><b>Documentation</b><small>Technical reference and guides</small></Link><button className="rc7-mobile-wallet" onClick={()=>{setMobile(false);onWalletClick()}}>{walletState.account?`Wallet · ${shortAddress(walletState.account)}`:'Connect wallet'}</button></nav></>}
  </>
}
