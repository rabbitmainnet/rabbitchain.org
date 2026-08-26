import { Link } from 'react-router-dom'
import Brand from './Brand'

const columns = [
  ['Network', [['Testnet', '/testnet'], ['Mainnet', '/mainnet'], ['Status', '/status'], ['RAB', '/rab'], ['Mining', '/mining']]],
  ['Technology', [['LCQ Consensus', '/lcq'], ['Run a Node', '/nodes'], ['Security', '/security'], ['Whitepaper', '/whitepaper']]],
  ['Build', [['Developers', '/developers'], ['Documentation', '/docs'], ['Releases', '/releases'], ['GitHub', 'https://github.com/rabbitmainnet']]],
  ['Platform', [
    ['Swap', '/platform/swap'],
    ['Liquidity', '/platform/liquidity'],
    ['Staking', '/platform/staking'],
    ['Bridge', '/platform/bridge'],
    ['P2P', '/platform/p2p'],
    ['Launchpool', '/platform/launchpool'],
    ['Token Factory', '/platform/factory'],
    ['Testnet Faucet', '/platform/faucet']
  ]],
  ['Project', [['Community', '/community'], ['About', '/about'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-and-conditions'], ['Risk Disclosure', '/risk-disclosure']]],
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Permissionless EVM Layer 1 powered by LCQ Consensus.</p>
          <strong>One wallet. One fair chance.</strong>
          <div className="footer-social"><a href="https://x.com/rabbit_mainnet" target="_blank" rel="noreferrer">X / Twitter ↗</a><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">GitHub ↗</a></div>
        </div>
        {columns.map(([title, items]) => (
          <div className="footer-col" key={title}>
            <span>{title}</span>
            {items.map(([label, to]) => (
              to.startsWith('http') ? <a key={label} href={to} target="_blank" rel="noreferrer">{label}</a> : <Link key={label} to={to}>{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Rabbit Chain</span>
        <span>Testnet 9280 · Mainnet 928</span>
        <span>rabbitchain.org</span>
      </div>
    </footer>
  )
}
