import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'

import {
  detectInjectedWallets,
} from '../lib/wallet'

function isMetaMask(wallet) {
  const name =
    String(wallet?.name || '').toLowerCase()

  const rdns =
    String(wallet?.rdns || '').toLowerCase()

  return (
    name === 'metamask' ||
    rdns === 'io.metamask' ||
    rdns.includes('metamask')
  )
}

export default function WalletModal({
  open,
  onClose,
  onSelect,
  onMetaMaskConnect,
}) {
  const [wallets, setWallets] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [
    metaMaskLoading,
    setMetaMaskLoading,
  ] = useState(false)

  const hasInstalledMetaMask =
    useMemo(
      () => wallets.some(isMetaMask),
      [wallets]
    )

  useEffect(() => {
    if (!open) return

    let active = true

    setLoading(true)

    detectInjectedWallets(450)
      .then((items) => {
        if (!active) return

        setWallets(items)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return

        setWallets([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setMetaMaskLoading(false)
    }
  }, [open])

  async function openMetaMask() {
    setMetaMaskLoading(true)

    try {
      await onMetaMaskConnect()
    } finally {
      setMetaMaskLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="wallet-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        <div className="wallet-modal-head">
          <div>
            <span>RABBIT WALLET</span>

            <h3 id="wallet-modal-title">
              Connect wallet
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wallet connection"
          >
            <X size={18} />
          </button>
        </div>

        <p className="wallet-modal-intro">
          Connect an installed EVM wallet or
          use the official MetaMask mobile
          connection.
        </p>

        {(loading || wallets.length > 0) && (
          <>
            <div className="wallet-section-label">
              <span>AVAILABLE ON THIS DEVICE</span>
              <i />
            </div>

            <div className="wallet-list">
              {loading && (
                <div className="wallet-loading">
                  Detecting wallets…
                </div>
              )}

              {!loading &&
                wallets.map((wallet) => (
                  <button
                    type="button"
                    key={
                      wallet.rdns ||
                      wallet.name
                    }
                    onClick={() =>
                      onSelect(wallet)
                    }
                  >
                    <span className="wallet-icon">
                      {wallet.icon ? (
                        <img
                          src={wallet.icon}
                          alt=""
                        />
                      ) : (
                        <Wallet size={19} />
                      )}
                    </span>

                    <span>
                      <b>{wallet.name}</b>

                      <small>
                        Installed wallet
                      </small>
                    </span>

                    <ArrowRight size={16} />
                  </button>
                ))}
            </div>
          </>
        )}

        {!hasInstalledMetaMask && (
          <>
            <div className="wallet-section-label">
              <span>METAMASK</span>
              <i />
            </div>

            <div className="wallet-connect-featured">
              <button
                type="button"
                onClick={openMetaMask}
                disabled={metaMaskLoading}
              >
                <span className="wallet-connect-mark">
                  <Smartphone size={22} />
                </span>

                <span>
                  <b>MetaMask</b>

                  <small>
                    {metaMaskLoading
                      ? 'Opening MetaMask…'
                      : 'Mobile · QR · browser extension'}
                  </small>
                </span>

                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}

        {!loading &&
          wallets.length === 0 && (
            <div className="wallet-mobile-row active">
              <Smartphone size={18} />

              <div>
                <b>Using another mobile wallet?</b>

                <small>
                  Open RabbitChain.org inside
                  that wallet's built-in browser.
                </small>
              </div>
            </div>
          )}

        <div className="wallet-security">
          <ShieldCheck size={16} />

          <span>
            Rabbit never asks for your seed
            phrase or private key.
          </span>
        </div>
      </div>
    </div>
  )
}
