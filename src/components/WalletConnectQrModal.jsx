import {
  Copy,
  QrCode,
  X,
} from 'lucide-react'

import {
  QRCodeSVG,
} from 'qrcode.react'

export default function WalletConnectQrModal({
  open,
  uri,
  onClose,
  toast,
}) {
  if (!open) return null

  async function copyUri() {
    if (!uri) return

    try {
      await navigator.clipboard.writeText(uri)

      toast?.(
        'WalletConnect link copied'
      )
    } catch {
      toast?.(
        'Could not copy WalletConnect link'
      )
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
    >
      <div
        className="wallet-modal"
        role="dialog"
        aria-modal="true"
        aria-label="WalletConnect QR Code"
        style={{
          maxWidth: 410,
        }}
      >
        <div className="wallet-modal-head">
          <div>
            <span>
              RABBIT CHAIN
            </span>

            <h3>
              WalletConnect
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

        <div
          style={{
            padding:
              '12px 0 6px',
            textAlign:
              'center',
          }}
        >
          {uri ? (
            <>
              <div
                style={{
                  width:
                    'min(340px, 88vw)',

                  margin:
                    '0 auto',

                  padding:
                    12,

                  background:
                    '#ffffff',

                  borderRadius:
                    16,

                  boxSizing:
                    'border-box',
                }}
              >
                <QRCodeSVG
                  value={uri}
                  size={320}
                  level="M"

                  //
                  // Quiet zone oficial:
                  // nenhum canto cortado.
                  //
                  marginSize={4}

                  bgColor="#ffffff"
                  fgColor="#111111"

                  title="Rabbit Chain WalletConnect QR"

                  style={{
                    display:
                      'block',

                    width:
                      '100%',

                    height:
                      'auto',

                    maxWidth:
                      '320px',

                    margin:
                      '0 auto',
                  }}
                />
              </div>

              <p
                style={{
                  margin:
                    '16px 0 10px',

                  fontWeight:
                    600,
                }}
              >
                Scan with your mobile wallet
              </p>

              <button
                type="button"
                onClick={copyUri}
                style={{
                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap:
                    7,

                  padding:
                    '8px 13px',

                  borderRadius:
                    999,

                  border:
                    '1px solid rgba(127,127,127,.25)',

                  background:
                    'transparent',

                  cursor:
                    'pointer',
                }}
              >
                <Copy size={14} />

                Copy link
              </button>
            </>
          ) : (
            <div
              style={{
                minHeight:
                  280,

                display:
                  'grid',

                placeItems:
                  'center',
              }}
            >
              <div>
                <QrCode
                  size={42}
                />

                <p>
                  Creating secure QR…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
