import { useEffect, useState } from 'react'
import { ArrowRight, QrCode, ShieldCheck, Smartphone, Wallet, X } from 'lucide-react'
import { detectInjectedWallets } from '../lib/wallet'

export default function WalletModal({ open, onClose, onSelect, onWalletConnect }) {
  const [wallets,setWallets]=useState([])
  const [loading,setLoading]=useState(false)
  const [remoteLoading,setRemoteLoading]=useState(false)

  useEffect(()=>{
    if(!open) return
    setLoading(true)
    detectInjectedWallets().then((items)=>{setWallets(items);setLoading(false)})
  },[open])

  useEffect(()=>{
    if(!open) setRemoteLoading(false)
  },[open])

  async function openWalletConnect(){
    setRemoteLoading(true)
    try{ await onWalletConnect() } finally { setRemoteLoading(false) }
  }

  if(!open) return null
  return <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
    <div className="wallet-modal" onMouseDown={(e)=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title">
      <div className="wallet-modal-head"><div><span>RABBIT WALLET</span><h3 id="wallet-modal-title">Connect a wallet</h3></div><button onClick={onClose} aria-label="Close wallet connection"><X size={18}/></button></div>
      <p className="wallet-modal-intro">Choose an installed EVM wallet or connect from another device with WalletConnect. Rabbit never asks for a seed phrase or private key.</p>

      <div className="wallet-connect-featured">
        <button type="button" onClick={openWalletConnect} disabled={remoteLoading}>
          <span className="wallet-connect-mark"><QrCode size={22}/></span>
          <span><b>WalletConnect</b><small>{remoteLoading?'Opening secure connection…':'QR code · mobile and desktop wallets'}</small></span>
          <ArrowRight size={17}/>
        </button>
      </div>

      <div className="wallet-section-label"><span>INSTALLED WALLETS</span><i/></div>
      <div className="wallet-list">
        {loading && <div className="wallet-loading">Looking for installed wallets…</div>}
        {!loading && wallets.map((wallet)=><button key={wallet.rdns || wallet.name} onClick={()=>onSelect(wallet)}><span className="wallet-icon">{wallet.icon?<img src={wallet.icon} alt=""/>:<Wallet size={19}/>}</span><span><b>{wallet.name}</b><small>Installed browser wallet</small></span><ArrowRight size={16}/></button>)}
        {!loading && wallets.length===0 && <div className="wallet-empty compact"><Wallet size={20}/><div><b>No injected wallet detected</b><p>You can still connect through WalletConnect above.</p></div></div>}
      </div>

      <div className="wallet-mobile-row active"><Smartphone size={18}/><div><b>Mobile ready</b><small>Scan the QR code or open a compatible wallet from your phone.</small></div><span>LIVE</span></div>
      <div className="wallet-security"><ShieldCheck size={16}/><span>Connecting only shares your public address and selected network. No signature is requested on connect.</span></div>
    </div>
  </div>
}
