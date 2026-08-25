import { Copy, ExternalLink, LogOut, Network, X } from 'lucide-react'
import { NETWORK_LIST } from '../config/networks'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

export default function WalletDrawer({ open, state, walletName, onClose, onDisconnect, onSwitch, toast }) {
  if(!open) return null
  const known = identifyRabbitNetwork(state.chainId)
  async function copyAddress(){
    try{await navigator.clipboard.writeText(state.account);toast('Address copied')}catch{toast('Could not copy address')}
  }
  return <div className="drawer-backdrop" onMouseDown={onClose}>
    <aside className="wallet-drawer" onMouseDown={(e)=>e.stopPropagation()}>
      <div className="drawer-head"><div><span>CONNECTED WALLET</span><h3>Your Rabbit</h3></div><button onClick={onClose}><X size={18}/></button></div>
      <div className="wallet-identity-card"><div className="wallet-avatar"><img src="/rabbit-mark.png" alt=""/></div><div><b>{shortAddress(state.account)}</b><small>{walletName || 'Browser Wallet'}</small></div><button onClick={copyAddress}><Copy size={15}/></button></div>
      <div className="current-network-card"><i className={`network-led ${known?'known':''}`}/><div><small>CURRENT NETWORK</small><b>{known?known.name:`Chain ${state.chainId ?? '—'}`}</b></div><span>{known?'RABBIT':'OTHER'}</span></div>
      <div className="drawer-section"><span className="drawer-label">RABBIT NETWORKS</span>{NETWORK_LIST.map((network)=><button className="drawer-network" key={network.key} onClick={()=>onSwitch(network)}><div><b>{network.name}</b><small>Chain ID {network.chainId}</small></div><span>{network.publicRpcReady?'SWITCH':'RPC PENDING'}</span></button>)}</div>
      <div className="drawer-info"><Network size={16}/><p>Rabbit Testnet launches first. Mainnet becomes available only after public validation and launch gates.</p></div>
      <a className="drawer-link" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Official GitHub <ExternalLink size={14}/></a>
      <button className="disconnect-btn" onClick={onDisconnect}><LogOut size={15}/> Disconnect from this site</button>
    </aside>
  </div>
}
