import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  QrCode,
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
    String(wallet?.name || '')
      .toLowerCase()

  const rdns =
    String(wallet?.rdns || '')
      .toLowerCase()

  return (
    name === 'metamask' ||
    rdns === 'io.metamask' ||
    rdns.includes('metamask')
  )
}

function Badge({
  children,
  active = false,
}) {
  return (
    <span
      style={{
        marginLeft: 'auto',
        padding: '4px 7px',
        borderRadius: '5px',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '.04em',
        background: active
          ? '#ddf7e7'
          : '#edf1f5',
        color: active
          ? '#159455'
          : '#5c6570',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export default function WalletModal({
  open,
  onClose,
  onSelect,
  onMetaMaskConnect,
  onWalletConnect,
}) {
  const [wallets, setWallets] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [
    connecting,
    setConnecting,
  ] = useState(null)

  const metaMask =
    useMemo(
      () => wallets.find(isMetaMask),
      [wallets]
    )

  const otherInstalled =
    useMemo(
      () =>
        wallets.filter(
          (wallet) =>
            !isMetaMask(wallet)
        ),
      [wallets]
    )

  useEffect(() => {
    if (!open) return

    let alive = true

    setLoading(true)

    detectInjectedWallets(450)
      .then((items) => {
        if (!alive) return

        setWallets(items)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return

        setWallets([])
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setConnecting(null)
    }
  }, [open])

  async function connectWC(mode) {
    setConnecting(
      mode === 'all'
        ? 'all'
        : 'wc'
    )

    try {
      await onWalletConnect()
    } finally {
      setConnecting(null)
    }
  }

  async function connectMetaMask() {
    setConnecting('metamask')

    try {
      if (metaMask) {
        await onSelect(metaMask)
      } else {
        await onMetaMaskConnect()
      }
    } finally {
      setConnecting(null)
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
        style={{
          maxWidth: 390,
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        <div className="wallet-modal-head">
          <div>
            <span>
              RABBIT CHAIN
            </span>

            <h3 id="wallet-modal-title">
              Connect Wallet
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="wallet-list">
          <button
            type="button"
            onClick={() =>
              connectWC()
            }
            disabled={
              connecting !== null
            }
          >
            <span className="wallet-icon">
              <QrCode size={21} />
            </span>

            <span>
              <b>
                WalletConnect
              </b>

              <small>
                {connecting === 'wc'
                  ? 'Opening QR…'
                  : 'Connect PC to your mobile wallet'}
              </small>
            </span>

            <Badge>
              QR CODE
            </Badge>
          </button>

          <button
            type="button"
            onClick={connectMetaMask}
            disabled={
              connecting !== null
            }
          >
            <span className="wallet-icon">
              {metaMask?.icon ? (
                <img
                  src={metaMask.icon}
                  alt=""
                />
              ) : (
                <Smartphone
                  size={21}
                />
              )}
            </span>

            <span>
              <b>
                MetaMask
              </b>

              <small>
                {connecting ===
                'metamask'
                  ? 'Opening MetaMask…'
                  : metaMask
                    ? 'Browser extension'
                    : 'Mobile · QR · browser'}
              </small>
            </span>

            <Badge active={Boolean(metaMask)}>
              {metaMask
                ? 'INSTALLED'
                : 'MOBILE'}
            </Badge>
          </button>

          {otherInstalled.map(
            (wallet) => (
              <button
                type="button"
                key={
                  wallet.rdns ||
                  wallet.name
                }
                onClick={() =>
                  onSelect(wallet)
                }
                disabled={
                  connecting !== null
                }
              >
                <span className="wallet-icon">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt=""
                    />
                  ) : (
                    <Wallet
                      size={20}
                    />
                  )}
                </span>

                <span>
                  <b>
                    {wallet.name}
                  </b>

                  <small>
                    Browser extension
                  </small>
                </span>

                <Badge active>
                  INSTALLED
                </Badge>
              </button>
            )
          )}

</div>

        {loading && (
          <div className="wallet-loading">
            Detecting installed wallets…
          </div>
        )}

        <div className="wallet-security">
          <ShieldCheck size={16} />

          <span>
            Rabbit never asks for your
            seed phrase or private key.
          </span>
        </div>
      </div>
    </div>
  )
}
