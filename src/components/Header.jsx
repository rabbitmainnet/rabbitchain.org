import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X, Wallet } from 'lucide-react'
import Brand from './Brand'
import { shortAddress } from '../lib/wallet'

const groups = [
  { label: 'Technology', links: [['LCQ Consensus','/lcq'],['Architecture','/lcq#architecture'],['Economics','/lcq#economics']] },
  { label: 'Network', links: [['Network Hub','/network'],['Testnet','/network?network=testnet'],['Mainnet','/network?network=mainnet']] },
  { label: 'Participate', links: [['Start Mining','/mining'],['Run a Node','/mining#node'],['Downloads','/mining#downloads']] },
  { label: 'Developers', links: [['Build on Rabbit','/developers'],['JSON-RPC','/developers#rpc'],['GitHub','https://github.com/rabbitmainnet']] }
]

export default function Header({ walletState, onWalletClick }) {
  const [open, setOpen] = useState(null)
  const [mobile, setMobile] = useState(false)
  return (
    <header className="site-header">
      <div className="header-shell">
        <Brand />
        <nav className="desktop-nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.label} onMouseEnter={() => setOpen(group.label)} onMouseLeave={() => setOpen(null)}>
              <button>{group.label}<ChevronDown size={13}/></button>
              {open === group.label && <div className="mega-menu">
                <div className="mega-label">{group.label.toUpperCase()}</div>
                {group.links.map(([label, href]) => href.startsWith('http') ? <a href={href} key={label} target="_blank" rel="noreferrer"><span>{label}</span><i>↗</i></a> : <Link to={href} key={label}><span>{label}</span><i>↗</i></Link>)}
              </div>}
            </div>
          ))}
          <NavLink to="/docs">Docs</NavLink>
        </nav>
        <div className="header-actions">
          <span className="header-status"><i/>TESTNET PREVIEW</span>
          <button className="wallet-button" onClick={onWalletClick}><Wallet size={15}/>{walletState.account ? shortAddress(walletState.account) : 'CONNECT WALLET'}</button>
          <button className="mobile-menu-btn" onClick={() => setMobile(!mobile)}>{mobile ? <X/> : <Menu/>}</button>
        </div>
      </div>
      {mobile && <div className="mobile-nav">
        {groups.flatMap((group) => group.links).filter(([,href]) => !href.startsWith('http')).map(([label,href]) => <Link key={`${label}-${href}`} onClick={() => setMobile(false)} to={href}>{label}<span>↗</span></Link>)}
        <Link onClick={() => setMobile(false)} to="/docs">Docs<span>↗</span></Link>
      </div>}
    </header>
  )
}
