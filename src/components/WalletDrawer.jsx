import { Copy, ExternalLink, X } from 'lucide-react'
import { NETWORK_LIST } from '../config/networks'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

export default function WalletDrawer({ open, state, walletName, onClose, onDisconnect, onSwitch, toast }) {
  if (!open) return null
  const known = identifyRabbitNetwork(state.chainId)
  const copy = async () => {
    if (!state.account) return
    await navigator.clipboard.writeText(state.account)
    toast('Address copied')
  }
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="wallet-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head"><div><span className="eyebrow">CONNECTED</span><h3>Your Rabbit wallet</h3></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
        <div className="wallet-identity-card">
          <span className="wallet-avatar"><img src="/favicon.png" alt=""/></span>
          <div><b>{shortAddress(state.account)}</b><small>{walletName || 'Browser Wallet'}</small></div>
          <button className="icon-btn" onClick={copy}><Copy size={15}/></button>
        </div>
        <div className="current-network-card">
          <span className={`network-led ${known ? 'known' : ''}`} />
          <div><small>CURRENT NETWORK</small><b>{known ? known.name : `Chain ${state.chainId ?? '—'}`}</b></div>
          {known?.explorerUrl && known.publicRpcReady && <a href={`${known.explorerUrl}/address/${state.account}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a>}
        </div>
        <div className="drawer-section"><span className="eyebrow">RABBIT NETWORKS</span>
          {NETWORK_LIST.map((network) => (
            <button className="drawer-network" key={network.key} onClick={() => onSwitch(network)}>
              <div><b>{network.name}</b><small>Chain ID {network.chainId} · {network.status}</small></div><span>{network.publicRpcReady ? 'SWITCH' : 'RPC PENDING'}</span>
            </button>
          ))}
        </div>
        <button className="disconnect-btn" onClick={onDisconnect}>Disconnect from site</button>
      </aside>
    </div>
  )
}
