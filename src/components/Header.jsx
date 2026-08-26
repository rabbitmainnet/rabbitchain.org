import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Code2, Menu, Search, Wallet, X } from 'lucide-react'
import Brand from './Brand'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

const groups = [
  {
    label: 'Network',
    intro: 'Connect to Rabbit and verify what is public.',
    links: [
      ['Rabbit Testnet', 'First public network · Chain ID 9280', '/testnet'],
      ['Rabbit Mainnet', 'Production network after validation', '/mainnet'],
      ['Network Status', 'RPC, explorer and faucet readiness', '/status'],
      ['RAB', 'Native asset and consensus rewards', '/rab'],
    ],
  },
  {
    label: 'Technology',
    intro: 'The protocol behind Rabbit block production.',
    links: [
      ['LCQ Consensus', 'Work, eligibility and producer coordination', '/lcq'],
      ['Mining', 'Permissionless participation path', '/mining'],
      ['Run a Node', 'P2P and independent infrastructure', '/nodes'],
      ['Security', 'Official domains, wallets and releases', '/security'],
    ],
  },
  {
    label: 'Build',
    intro: 'EVM tooling with Rabbit network parameters.',
    links: [
      ['Developers', 'EVM, JSON-RPC and integration paths', '/developers'],
      ['Documentation', 'Protocol and network reference', '/docs'],
      ['Releases', 'Official binaries and verification', '/releases'],
      ['GitHub', 'Open-source repositories', 'https://github.com/rabbitmainnet'],
    ],
  },
]

export default function Header({ walletState, onWalletClick, onOpenSearch }) {
  const [open, setOpen] = useState(null)
  const [mobile, setMobile] = useState(false)
  const location = useLocation()
  const navRef = useRef(null)
  const activeNetwork = identifyRabbitNetwork(walletState.chainId)

  useEffect(() => {
    setOpen(null)
    setMobile(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onPointer = (event) => {
      if (open && navRef.current && !navRef.current.contains(event.target)) setOpen(null)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(null)
        setMobile(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!mobile) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [mobile])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement">
        <div className="shell announcement-inner">
          <span className="notranslate" translate="no"><i /> RABBIT TESTNET · FIRST PUBLIC LAUNCH · CHAIN ID 9280</span>
          <Link to="/status">Network status <span>→</span></Link>
        </div>
      </div>

      <header className="site-header">
        <div className="shell header-shell">
          <Brand />

          <nav className="desktop-nav" ref={navRef} aria-label="Primary navigation">
            {groups.map((group) => (
              <div className="nav-group" key={group.label}>
                <button
                  type="button"
                  className={open === group.label ? 'nav-open' : ''}
                  aria-expanded={open === group.label}
                  aria-haspopup="true"
                  onClick={() => setOpen(open === group.label ? null : group.label)}
                >
                  {group.label}<ChevronDown size={13} />
                </button>
                {open === group.label && (
                  <div className="mega-menu">
                    <div className="mega-menu-intro">
                      <span>{group.label.toUpperCase()}</span>
                      <p>{group.intro}</p>
                    </div>
                    <div className="mega-menu-links">
                      {group.links.map(([label, description, to]) => (
                        to.startsWith('http') ? (
                          <a href={to} target="_blank" rel="noreferrer" key={label}>
                            <span><b>{label}</b><small>{description}</small></span><em>↗</em>
                          </a>
                        ) : (
                          <Link to={to} key={label}>
                            <span><b>{label}</b><small>{description}</small></span><em>→</em>
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <NavLink className="nav-platform" to="/platform">Platform</NavLink>
            <NavLink to="/community">Community</NavLink>
          </nav>

          <div className="header-actions">
            <button className="search-button" onClick={onOpenSearch} aria-label="Search Rabbit Chain">
              <Search size={15} /><span>Search</span><kbd>⌘K</kbd>
            </button>
            <a className="icon-button" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer" aria-label="Rabbit Chain on GitHub">
              <Code2 size={17} />
            </a>
            <button className={`wallet-button ${walletState.account ? 'connected' : ''}`} onClick={onWalletClick}>
              {walletState.account ? <span className="wallet-connected-dot" /> : <Wallet size={15} />}
              <span className="wallet-button-copy">{walletState.account ? shortAddress(walletState.account) : 'Connect wallet'}</span>
              {walletState.account && <small>{activeNetwork?.shortName || 'Wallet'}</small>}
              {walletState.account && <ChevronDown size={13} />}
            </button>
            <button className="mobile-button" aria-expanded={mobile} aria-label={mobile ? 'Close navigation' : 'Open navigation'} onClick={() => setMobile(!mobile)}>
              {mobile ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      {mobile && (
        <>
          <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)} />
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <div className="mobile-nav-head"><Brand compact /><div><b>Rabbit Chain</b><span>Official network portal</span></div></div>
            <Link className="mobile-platform" to="/platform">Rabbit Platform <span>→</span></Link>
            <span className="mobile-nav-label">NETWORK</span>
            <Link to="/testnet">Rabbit Testnet</Link><Link to="/mainnet">Rabbit Mainnet</Link><Link to="/status">Network Status</Link><Link to="/rab">RAB</Link>
            <span className="mobile-nav-label">TECHNOLOGY</span>
            <Link to="/lcq">LCQ Consensus</Link><Link to="/mining">Mining</Link><Link to="/nodes">Run a Node</Link><Link to="/security">Security</Link>
            <span className="mobile-nav-label">BUILD</span>
            <Link to="/developers">Developers</Link><Link to="/docs">Documentation</Link><Link to="/releases">Releases</Link><Link to="/community">Community</Link>
            <button className="mobile-wallet" onClick={() => { setMobile(false); onWalletClick() }}>
              {walletState.account ? `Wallet · ${shortAddress(walletState.account)}` : 'Connect wallet'}
            </button>
          </nav>
        </>
      )}
    </>
  )
}
