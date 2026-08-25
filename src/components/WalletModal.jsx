import { useEffect, useState } from 'react'
import { X, Wallet, Smartphone } from 'lucide-react'
import { detectInjectedWallets } from '../lib/wallet'

export default function WalletModal({ open, onClose, onSelect }) {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    detectInjectedWallets().then((items) => {
      setWallets(items)
      setLoading(false)
    })
  }, [open])

  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="wallet-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="wallet-modal-head">
          <div><span className="eyebrow">RABBIT WALLET</span><h2>Connect to Rabbit</h2></div>
          <button className="icon-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <p className="modal-copy">Connect a browser wallet to use network tools. Rabbit never asks for your seed phrase or private key.</p>
        <div className="wallet-options">
          {loading && <div className="wallet-placeholder">Searching for wallets…</div>}
          {!loading && wallets.map((wallet, index) => (
            <button className="wallet-option" key={`${wallet.name}-${index}`} onClick={() => onSelect(wallet)}>
              <span className="wallet-option-icon">{wallet.icon ? <img src={wallet.icon} alt=""/> : <Wallet size={19}/>}</span>
              <span><b>{wallet.name}</b><small>{wallet.rdns || 'Injected wallet'}</small></span>
              <i>↗</i>
            </button>
          ))}
          {!loading && wallets.length === 0 && <div className="wallet-placeholder"><Wallet size={18}/><span>No injected wallet detected. Install MetaMask, Rabby, Coinbase Wallet, or another EVM wallet.</span></div>}
        </div>
        <div className="walletconnect-preview"><Smartphone size={18}/><div><b>WalletConnect / Mobile</b><small>Ready for the official Rabbit Reown project ID.</small></div><span>COMING NEXT</span></div>
      </div>
    </div>
  )
}
