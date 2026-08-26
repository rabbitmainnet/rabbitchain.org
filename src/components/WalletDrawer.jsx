import { CheckCircle2, Copy, ExternalLink, LogOut, Network, Plus, X } from 'lucide-react'
import { NETWORKS, NETWORK_LIST } from '../config/networks'
import { identifyRabbitNetwork, shortAddress } from '../lib/wallet'

export default function WalletDrawer({ open, state, walletName, onClose, onDisconnect, onSwitch, toast }) {
  if(!open) return null
  const known = identifyRabbitNetwork(state.chainId)
  const testnet = NETWORKS.testnet
  async function copyAddress(){
    try{await navigator.clipboard.writeText(state.account);toast('Address copied')}catch{toast('Could not copy address')}
  }
  return <div className="drawer-backdrop" onMouseDown={onClose}>
    <aside className="wallet-drawer" onMouseDown={(e)=>e.stopPropagation()}>
      <div className="drawer-head"><div><span>RABBIT WALLET</span><h3>Wallet connected</h3></div><button onClick={onClose} aria-label="Close wallet panel"><X size={18}/></button></div>

      <div className="wallet-session-pill"><CheckCircle2 size={14}/><span>CONNECTED TO THIS SITE</span></div>

      <div className="wallet-identity-card">
        <div className="wallet-avatar"><img src="/rabbit-wallet-icon.png" alt="Rabbit Chain"/></div>
        <div><b>{shortAddress(state.account)}</b><small>{walletName || 'Browser Wallet'}</small></div>
        <button onClick={copyAddress} aria-label="Copy wallet address"><Copy size={15}/></button>
      </div>

      <div className="current-network-card"><i className={`network-led ${known?'known':''}`}/><div><small>CURRENT NETWORK</small><b>{known?known.name:`Chain ${state.chainId ?? '—'}`}</b></div><span>{known?'RABBIT':'OTHER'}</span></div>

      <div className="drawer-primary-network">
        <div><span>QUICK NETWORK</span><b>Rabbit Testnet</b><small>Chain ID 9280 · LCQ · EVM</small></div>
        <button type="button" disabled={state.chainId===testnet.chainId} onClick={()=>onSwitch(testnet)}>
          {state.chainId===testnet.chainId?<><CheckCircle2 size={14}/> Added</>:<><Plus size={14}/> Add / switch</>}
        </button>
      </div>

      <div className="drawer-section"><span className="drawer-label">RABBIT NETWORKS</span>{NETWORK_LIST.map((network)=>{
        const current=state.chainId===network.chainId
        const available=current || network.walletEnabled
        return <button className={`drawer-network ${current?'current':''}`} key={network.key} disabled={current || !available} onClick={()=>onSwitch(network)}>
          <div><b>{network.name}</b><small>Chain ID {network.chainId}</small></div>
          <span>{current?'CONNECTED':network.walletEnabled?'ADD / SWITCH':'COMING LATER'}</span>
        </button>
      })}</div>

      <div className="drawer-info"><Network size={16}/><p>Add Network uses the wallet's native EVM network flow. If a public RPC is still coming online, some wallets may reject the request until launch. Rabbit never asks for a seed phrase or private key.</p></div>
      <a className="drawer-link" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Official GitHub <ExternalLink size={14}/></a>

      <div className="disconnect-zone">
        <div><span>SESSION</span><p>Disconnect RabbitChain.org from this wallet on this browser.</p></div>
        <button className="disconnect-btn" onClick={onDisconnect}><LogOut size={15}/> Disconnect wallet</button>
      </div>
    </aside>
  </div>
}
