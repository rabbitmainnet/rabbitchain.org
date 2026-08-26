import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ChevronDown,
  Settings2,
  Wallet,
} from 'lucide-react'
import { PLATFORM_NETWORKS } from '../config/platform'
import { NETWORKS } from '../config/networks'

function TokenLogo({ token }) {
  if (!token) {
    return (
      <span className="rabbit-token-logo rabbit-token-logo-fallback">
        ?
      </span>
    )
  }

  if (token.logo) {
    return (
      <span className="rabbit-token-logo">
        <img src={token.logo} alt={`${token.symbol} logo`} />
      </span>
    )
  }

  return (
    <span className="rabbit-token-logo rabbit-token-logo-fallback">
      {token.symbol.slice(0, 1)}
    </span>
  )
}

function TokenSelector({
  token,
  network,
  open,
  onToggle,
  onSelect,
  exclude,
}) {
  const candidates = network.tokens.filter(
    (item) => item.symbol !== exclude
  )

  return (
    <div className="rabbit-token-selector">
      <button
        type="button"
        className="rabbit-token-button"
        onClick={onToggle}
      >
        <TokenLogo token={token} />

        <span>
          <b>{token?.symbol || 'Select token'}</b>
          <small>{token?.name || network.name}</small>
        </span>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="rabbit-token-menu">
          <div className="rabbit-token-menu-head">
            <b>Select token</b>
            <small>{network.name}</small>
          </div>

          {candidates.length ? (
            candidates.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => onSelect(item.symbol)}
              >
                <TokenLogo token={item} />

                <span>
                  <b>{item.symbol}</b>
                  <small>{item.name}</small>
                </span>
              </button>
            ))
          ) : (
            <p>
              No additional verified token is configured for this
              network yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function RabbitSwapPanel({
  networkKey = 'testnet',
  walletState,
  onConnect,
  onSwitchNetwork,
  variant = 'platform',
}) {
  const network =
    PLATFORM_NETWORKS[networkKey] ||
    PLATFORM_NETWORKS.testnet

  const [fromSymbol, setFromSymbol] = useState(
    network.defaultFrom
  )

  const [toSymbol, setToSymbol] = useState(
    network.defaultTo
  )

  const [amount, setAmount] = useState('')
  const [openSelector, setOpenSelector] = useState(null)

  useEffect(() => {
    setFromSymbol(network.defaultFrom)
    setToSymbol(network.defaultTo)
    setAmount('')
    setOpenSelector(null)
  }, [networkKey, network.defaultFrom, network.defaultTo])

  const fromToken =
    network.tokens.find((token) => token.symbol === fromSymbol) ||
    network.tokens[0] ||
    null

  const toToken =
    network.tokens.find((token) => token.symbol === toSymbol) ||
    null

  const connected = Boolean(walletState?.account)
  const expectedChainId = Number(network.chainId)
  const wrongNetwork = connected && walletState?.chainId !== expectedChainId

  const actionLabel = !connected
    ? 'Connect wallet'
    : wrongNetwork
      ? `Switch to ${network.name}`
      : network.swapLive
        ? 'Review swap'
        : 'Swap activates after contracts'

  function handleAction() {
    if (!connected) {
      onConnect?.()
      return
    }

    if (wrongNetwork) {
      onSwitchNetwork?.(NETWORKS[networkKey])
    }
  }

  function switchTokens() {
    if (!fromToken || !toToken) return

    setFromSymbol(toToken.symbol)
    setToSymbol(fromToken.symbol)
  }

  return (
    <div
      className={`product-panel product-swap rabbit-swap-panel rabbit-swap-panel--${variant}`}
    >
      <div className="rabbit-swap-toolbar">
        <div>
          <strong>Swap</strong>
          <small>
            {network.name} · Chain ID {network.chainId}
          </small>
        </div>

        <span>{network.status}</span>
      </div>

      <div className="rabbit-swap-field">
        <label>From</label>

        <div className="rabbit-swap-field-main">
          <TokenSelector
            token={fromToken}
            network={network}
            open={openSelector === 'from'}
            exclude={toToken?.symbol}
            onToggle={() =>
              setOpenSelector(
                openSelector === 'from' ? null : 'from'
              )
            }
            onSelect={(symbol) => {
              setFromSymbol(symbol)
              setOpenSelector(null)
            }}
          />

          <div className="rabbit-swap-amount">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value.replace(
                    /[^0-9.]/g,
                    ''
                  )
                )
              }
              placeholder="0.00"
              aria-label="Amount to swap"
            />

            <small>~0.00 USD</small>
          </div>
        </div>
      </div>

      <div className="rabbit-swap-direction">
        <button
          type="button"
          onClick={switchTokens}
          aria-label="Switch tokens"
        >
          <ArrowDown size={16} />
        </button>
      </div>

      <div className="rabbit-swap-field">
        <label>To</label>

        <div className="rabbit-swap-field-main">
          <TokenSelector
            token={toToken}
            network={network}
            open={openSelector === 'to'}
            exclude={fromToken?.symbol}
            onToggle={() =>
              setOpenSelector(
                openSelector === 'to' ? null : 'to'
              )
            }
            onSelect={(symbol) => {
              setToSymbol(symbol)
              setOpenSelector(null)
            }}
          />

          <div className="rabbit-swap-amount">
            <input
              value=""
              readOnly
              placeholder="0.00"
              aria-label="Estimated received amount"
            />

            <small>~0.00 USD</small>
          </div>
        </div>
      </div>

      <div className="rabbit-swap-settings">
        <span>Slippage tolerance</span>

        <button type="button" disabled>
          Auto: 0.50%
          <Settings2 size={14} />
        </button>
      </div>

      <button
        type="button"
        className="rabbit-swap-action"
        onClick={handleAction}
        disabled={connected && !wrongNetwork && !network.swapLive}
      >
        <Wallet size={16} />
        {actionLabel}
      </button>

      <p className="rabbit-swap-disclaimer">
        {network.swapLive
          ? 'Quotes and transactions use the verified Rabbit Platform contracts configured for this network.'
          : 'No swap is presented as live until the official contracts, liquidity and routing are released.'}
      </p>
    </div>
  )
}
