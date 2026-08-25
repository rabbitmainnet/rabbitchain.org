import { useEffect, useState } from 'react'
import { X, Wallet, Smartphone, ShieldCheck } from 'lucide-react'
import { detectInjectedWallets } from '../lib/wallet'

export default function WalletModal({ open, onClose, onSelect }) {
  const [wallets,setWallets]=useState([])
  const [loading,setLoading]=useState(false)
  useEffect(()=>{
    if(!open) return
    setLoading(true)
    detectInjectedWallets().then((items)=>{setWallets(items);setLoading(false)})
  },[open])
  if(!open) return null
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="wallet-modal" onMouseDown={(e)=>e.stopPropagation()}>
      <div className="wallet-modal-head"><div><span>RABBIT WALLET</span><h3>Connect a wallet</h3></div><button onClick={onClose} aria-label="Close"><X size={18}/></button></div>
      <p className="wallet-modal-intro">Connect to inspect your address and network. Rabbit never asks for your seed phrase or private key.</p>
      <div className="wallet-list">
        {loading && <div className="wallet-loading">Looking for installed wallets…</div>}
        {!loading && wallets.map((wallet)=><button key={wallet.rdns || wallet.name} onClick={()=>onSelect(wallet)}><span className="wallet-icon">{wallet.icon?<img src={wallet.icon} alt=""/>:<Wallet size={19}/>}</span><span><b>{wallet.name}</b><small>Browser wallet · EIP-6963</small></span><ArrowRightIcon/></button>)}
        {!loading && wallets.length===0 && <div className="wallet-empty"><Wallet size={22}/><div><b>No browser wallet detected</b><p>Install an EVM-compatible wallet such as MetaMask or Rabby, then reopen this panel.</p></div></div>}
      </div>
      <div className="wallet-mobile-row"><Smartphone size={18}/><div><b>Mobile / QR wallets</b><small>WalletConnect can be enabled after the official Rabbit Reown project ID is configured.</small></div><span>PLANNED</span></div>
      <div className="wallet-security"><ShieldCheck size={16}/><span>Connecting does not sign a transaction or grant custody.</span></div>
    </div>
  </div>
}

function ArrowRightIcon(){ return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4"/></svg> }
