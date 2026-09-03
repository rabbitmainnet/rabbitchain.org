import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CheckCircle2,
  Factory,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { formatUnits } from 'viem'
import { NETWORKS } from '../config/networks'
import {
  RABBIT_TOKEN_FACTORY_ABI,
  RABBIT_TOKEN_FACTORY_TESTNET,
} from '../config/factory'
import {
  RABBIT_SWAP_ERC20_ABI,
  RABBIT_SWAP_TESTNET,
} from '../config/swap'
import {
  approveExact,
  readAllowance,
  readRabbitContract,
  readTokenBalance,
  readTokenMetadata,
  sendRabbitContract,
  waitForRabbitReceipt,
} from '../lib/rabbitSwap'
import { friendlyWalletError, shortAddress } from '../lib/wallet'

const TESTNET = NETWORKS.testnet
const TRUSD_TOKEN = RABBIT_SWAP_TESTNET.tokens.tRUSD
const TRAB_TOKEN = RABBIT_SWAP_TESTNET.tokens.tRAB
const STORAGE_KEY = 'rabbit.swap.testnet.importedTokens.v1'
const MAX_MY_TOKENS = 6

function formatCompactUnits(value, decimals, maxFraction = 6) {
  if (value === null || value === undefined) return '—'
  const formatted = formatUnits(BigInt(value), decimals)
  const [whole, fraction = ''] = formatted.split('.')
  const trimmed = fraction.slice(0, maxFraction).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

function rememberFactoryToken(token) {
  if (typeof window === 'undefined' || !token?.address) return
  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    const list = Array.isArray(current) ? current : []
    const normalized = token.address.toLowerCase()
    const entry = {
      key: normalized,
      symbol: token.symbol,
      name: token.name,
      description: `Rabbit Token Factory · fixed supply · ${token.decimals} decimals`,
      decimals: token.decimals,
      native: false,
      address: token.address,
      logo: null,
      imported: true,
      factoryToken: true,
    }
    const next = [
      ...list.filter((item) => item?.address?.toLowerCase() !== normalized),
      entry,
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {}
}

function Capability({ children }) {
  return <span><CheckCircle2 size={14} />{children}</span>
}

// RABBIT_FACTORY_SWAP_ASSET_LOGOS_V6
// Reuses the exact same token.logo configuration used by Rabbit Swap.
function FactoryAssetLogo({ token, size = 'normal' }) {
  if (!token?.logo) return null

  return (
    <span className={`rabbit-factory-asset-logo ${size === 'small' ? 'small' : ''}`}>
      <img src={token.logo} alt={`${token.symbol} logo`} />
    </span>
  )
}

function FactoryAssetName({ token, compact = false }) {
  return (
    <span className={`rabbit-factory-asset-name ${compact ? 'compact' : ''}`}>
      <FactoryAssetLogo token={token} size={compact ? 'small' : 'normal'} />
      <span>{token.symbol}</span>
    </span>
  )
}

// RABBIT_FACTORY_PROVIDER_FALLBACK_V5
// Prefer the connected wallet provider for Rabbit Testnet reads. If that
// provider temporarily rejects a read-only RPC method, retry through the
// official public RPC. A caller can then preserve its last successful value
// if both sources are temporarily unavailable.
async function readWithFactoryFallback(reader, primaryProvider) {
  try {
    return await reader(primaryProvider)
  } catch (primaryError) {
    if (!primaryProvider) throw primaryError
    return reader(null)
  }
}

export default function RabbitTokenFactoryPanel({
  walletState,
  walletProvider,
  onConnect,
  onSwitchNetwork,
  toast,
}) {
  const account = walletState?.account || null
  const connected = Boolean(account)
  const correctNetwork = connected && walletState?.chainId === TESTNET.chainId
  const provider = correctNetwork && walletProvider?.request ? walletProvider : null

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [supply, setSupply] = useState('')
  const [decimals, setDecimals] = useState(18)
  const [payment, setPayment] = useState('TRUSD')

  const [feeStatus, setFeeStatus] = useState({
    trusdFee: RABBIT_TOKEN_FACTORY_TESTNET.feeTRUSD,
    rabFee: 0n,
    oracleFresh: false,
  })
  const [allowance, setAllowance] = useState(0n)
  const [balances, setBalances] = useState({ trusd: null, trab: null })
  const [myTokens, setMyTokens] = useState([])
  const [createdToken, setCreatedToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(null)
  const refreshSequence = useRef(0)

  const normalizedSymbol = symbol.replace(/\s+/g, '').toUpperCase().slice(0, 16)

  const supplyValue = useMemo(() => {
    const clean = String(supply || '').replace(/[,_\s]/g, '')
    if (!/^\d+$/.test(clean)) return 0n
    try { return BigInt(clean) } catch { return 0n }
  }, [supply])

  const formValid =
    name.trim().length > 0 &&
    name.trim().length <= 64 &&
    normalizedSymbol.length > 0 &&
    normalizedSymbol.length <= 16 &&
    supplyValue > 0n &&
    RABBIT_TOKEN_FACTORY_TESTNET.supportedDecimals.includes(decimals)

  const trusdBalanceEnough =
    balances.trusd === null || balances.trusd >= feeStatus.trusdFee

  const rabBalanceEnough =
    balances.trab === null ||
    !feeStatus.oracleFresh ||
    feeStatus.rabFee === 0n ||
    balances.trab >= feeStatus.rabFee

  const needsApproval = allowance < feeStatus.trusdFee

  const refreshMyTokens = useCallback(async (addressForCreator, primaryProvider) => {
    if (!addressForCreator) {
      setMyTokens([])
      return
    }

    const loadTokens = async (readProvider) => {
      const countRaw = await readRabbitContract({
        address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        abi: RABBIT_TOKEN_FACTORY_ABI,
        functionName: 'creatorTokenCount',
        args: [addressForCreator],
        provider: readProvider,
      })

      const count = Number(countRaw)
      if (!Number.isFinite(count) || count <= 0) return []

      const limit = Math.min(count, MAX_MY_TOKENS)
      const start = Math.max(0, count - limit)

      const addresses = await readRabbitContract({
        address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        abi: RABBIT_TOKEN_FACTORY_ABI,
        functionName: 'getCreatorTokensPaginated',
        args: [addressForCreator, BigInt(start), BigInt(limit)],
        provider: readProvider,
      })

      const reads = await Promise.allSettled(
        addresses.map((tokenAddress) => readTokenMetadata(tokenAddress, readProvider))
      )

      return reads
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .reverse()
    }

    try {
      const tokens = await readWithFactoryFallback(loadTokens, primaryProvider)
      tokens.forEach(rememberFactoryToken)
      setMyTokens(tokens)
    } catch {
      // Do not erase a previously loaded registry during a transient read error.
    }
  }, [])

  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current
    setLoading(true)

    // `provider` is non-null only while the connected wallet is on Rabbit
    // Testnet. It is therefore the safest primary source for account reads.
    // Public RPC is only the fallback.
    const primaryProvider = provider

    try {
      const status = await readWithFactoryFallback(
        (readProvider) => readRabbitContract({
          address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
          abi: RABBIT_TOKEN_FACTORY_ABI,
          functionName: 'getCreationFeeStatus',
          provider: readProvider,
        }),
        primaryProvider,
      )

      if (sequence !== refreshSequence.current) return

      setFeeStatus({
        trusdFee: BigInt(status[0]),
        rabFee: BigInt(status[1]),
        oracleFresh: Boolean(status[2]),
      })
    } catch {
      // Keep last successfully displayed fee/TWAP state.
    }

    if (sequence !== refreshSequence.current) return

    if (account) {
      const reads = await Promise.allSettled([
        readWithFactoryFallback(
          (readProvider) => readAllowance(
            RABBIT_TOKEN_FACTORY_TESTNET.tRUSD,
            account,
            RABBIT_TOKEN_FACTORY_TESTNET.factory,
            readProvider,
            RABBIT_SWAP_ERC20_ABI,
          ),
          primaryProvider,
        ),
        readWithFactoryFallback(
          (readProvider) => readTokenBalance(TRUSD_TOKEN, account, readProvider),
          primaryProvider,
        ),
        readWithFactoryFallback(
          (readProvider) => readTokenBalance(TRAB_TOKEN, account, readProvider),
          primaryProvider,
        ),
      ])

      if (sequence !== refreshSequence.current) return

      if (reads[0].status === 'fulfilled') {
        setAllowance(BigInt(reads[0].value))
      }

      setBalances((current) => ({
        trusd: reads[1].status === 'fulfilled'
          ? BigInt(reads[1].value)
          : current.trusd,
        trab: reads[2].status === 'fulfilled'
          ? BigInt(reads[2].value)
          : current.trab,
      }))

      await refreshMyTokens(account, primaryProvider)

      if (sequence !== refreshSequence.current) return
    } else {
      setAllowance(0n)
      setBalances({ trusd: null, trab: null })
      setMyTokens([])
    }

    if (sequence === refreshSequence.current) setLoading(false)
  }, [account, provider, refreshMyTokens])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function findNewestCreatorToken() {
    const countRaw = await readWithFactoryFallback(
      (readProvider) => readRabbitContract({
        address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        abi: RABBIT_TOKEN_FACTORY_ABI,
        functionName: 'creatorTokenCount',
        args: [account],
        provider: readProvider,
      }),
      provider,
    )

    const count = Number(countRaw)
    if (!Number.isFinite(count) || count <= 0) {
      throw new Error('Factory token was created but could not be discovered')
    }

    const addresses = await readWithFactoryFallback(
      (readProvider) => readRabbitContract({
        address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        abi: RABBIT_TOKEN_FACTORY_ABI,
        functionName: 'getCreatorTokensPaginated',
        args: [account, BigInt(count - 1), 1n],
        provider: readProvider,
      }),
      provider,
    )

    if (!addresses?.[0]) throw new Error('Factory token address unavailable')

    const token = await readWithFactoryFallback(
      (readProvider) => readTokenMetadata(addresses[0], readProvider),
      provider,
    )

    rememberFactoryToken(token)
    return token
  }

  async function submitFactoryTransaction(functionName, value = 0n) {
    const hash = await sendRabbitContract({
      provider: walletProvider,
      account,
      address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
      abi: RABBIT_TOKEN_FACTORY_ABI,
      functionName,
      args: [name.trim(), normalizedSymbol, decimals, supplyValue],
      value,
    })

    const receipt = await waitForRabbitReceipt(hash, walletProvider)
    if (receipt?.status === '0x0') throw new Error('Token creation transaction reverted')
    if (!receipt) throw new Error('Token creation submitted but confirmation is taking longer than expected')

    return hash
  }

  async function createWithTRUSD() {
    const approvalRequired = allowance < feeStatus.trusdFee
    const totalSteps = approvalRequired ? 2 : 1

    if (approvalRequired) {
      setPending(`Step 1 of ${totalSteps} — Approving 100 tRUSD…`)
      await approveExact({
        provider: walletProvider,
        account,
        tokenAddress: RABBIT_TOKEN_FACTORY_TESTNET.tRUSD,
        spender: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        amount: feeStatus.trusdFee,
        currentAllowance: allowance,
        abi: RABBIT_SWAP_ERC20_ABI,
        onReset: () => toast?.('Resetting existing tRUSD allowance first'),
      })
      toast?.('100 tRUSD approved for Rabbit Token Factory')
    }

    setPending(`${approvalRequired ? `Step 2 of ${totalSteps}` : 'Creating'} — Deploying token…`)
    await submitFactoryTransaction('createTokenWithTRUSD')
  }

  async function createWithRAB() {
    let rabFee = feeStatus.rabFee
    let oracleFresh = feeStatus.oracleFresh
    let step = 1
    const totalSteps = oracleFresh && rabFee > 0n ? 1 : 2

    if (!oracleFresh || rabFee <= 0n) {
      setPending(`Step ${step} of ${totalSteps} — Refreshing TWAP…`)
      const hash = await sendRabbitContract({
        provider: walletProvider,
        account,
        address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
        abi: RABBIT_TOKEN_FACTORY_ABI,
        functionName: 'refreshOracle',
      })
      const receipt = await waitForRabbitReceipt(hash, walletProvider)
      if (receipt?.status === '0x0') throw new Error('TWAP refresh reverted')
      if (!receipt) throw new Error('TWAP refresh confirmation is taking longer than expected')

      const status = await readWithFactoryFallback(
        (readProvider) => readRabbitContract({
          address: RABBIT_TOKEN_FACTORY_TESTNET.factory,
          abi: RABBIT_TOKEN_FACTORY_ABI,
          functionName: 'getCreationFeeStatus',
          provider: readProvider,
        }),
        provider,
      )
      oracleFresh = Boolean(status[2])
      rabFee = BigInt(status[1])
      if (!oracleFresh || rabFee <= 0n) {
        throw new Error('TWAP observation is not ready yet')
      }
      step += 1
      toast?.(`TWAP refreshed · fee ${formatCompactUnits(rabFee, 18, 8)} tRAB`)
    }

    setPending(`${totalSteps > 1 ? `Step ${step} of ${totalSteps}` : 'Creating'} — Deploying token…`)

    // msg.value is a maximum, not the final charge. The Factory charges the
    // exact TWAP-equivalent fee and refunds any excess. A 1% buffer protects
    // the UX against a price refresh landing exactly on the next TWAP window.
    const maxValue = rabFee + (rabFee / 100n) + 1n
    await submitFactoryTransaction('createTokenWithRAB', maxValue)
  }

  async function addTokenToWallet(token) {
    if (!token?.address) return

    if (!walletProvider?.request) {
      toast?.('Connect a compatible wallet to add this token')
      onConnect?.()
      return
    }

    try {
      const accepted = await walletProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      })

      if (accepted !== false) {
        toast?.(`${token.symbol} added to wallet`)
      }
    } catch (error) {
      toast?.(
        friendlyWalletError(
          error,
          `Your wallet could not add ${token.symbol} automatically`,
        ),
      )
    }
  }

  async function handleCreate() {
    if (!connected) return onConnect?.()
    if (!correctNetwork) return onSwitchNetwork?.(TESTNET)
    if (!formValid || pending) return

    if (payment === 'TRUSD' && !trusdBalanceEnough) {
      toast?.('Insufficient tRUSD balance for the 100 tRUSD creation fee')
      return
    }
    if (payment === 'RAB' && !rabBalanceEnough) {
      toast?.('Insufficient tRAB balance for the current TWAP creation fee')
      return
    }

    setCreatedToken(null)

    try {
      if (payment === 'TRUSD') await createWithTRUSD()
      else await createWithRAB()

      setPending('Confirming factory registry…')
      const token = await findNewestCreatorToken()
      setCreatedToken(token)
      toast?.(`${token.symbol} created on Rabbit Testnet`)

      setName('')
      setSymbol('')
      setSupply('')
      await refresh()
    } catch (error) {
      toast?.(friendlyWalletError(error, 'Token creation failed'))
    } finally {
      setPending(null)
    }
  }

  let actionLabel = 'Create token'
  let actionDisabled = false

  if (!connected) actionLabel = 'Connect wallet'
  else if (!correctNetwork) actionLabel = 'Switch to Rabbit Testnet'
  else if (!formValid) {
    actionLabel = 'Complete token details'
    actionDisabled = true
  } else if (payment === 'TRUSD' && !trusdBalanceEnough) {
    actionLabel = 'Insufficient tRUSD'
    actionDisabled = true
  } else if (payment === 'TRUSD' && needsApproval) {
    actionLabel = 'Approve & create · 100 tRUSD'
  } else if (payment === 'TRUSD') {
    actionLabel = 'Create token · 100 tRUSD'
  } else if (!feeStatus.oracleFresh || feeStatus.rabFee <= 0n) {
    actionLabel = 'Refresh TWAP & create'
  } else if (!rabBalanceEnough) {
    actionLabel = 'Insufficient tRAB'
    actionDisabled = true
  } else {
    actionLabel = `Create token · ${formatCompactUnits(feeStatus.rabFee, 18, 6)} tRAB`
  }

  if (pending) {
    actionLabel = pending
    actionDisabled = true
  }

  return (
    <div className="rabbit-factory">
      <div className="rabbit-factory-topline">
        <div>
          <span><CheckCircle2 size={14} /> DEPLOYED TESTNET FACTORY</span>
          <strong>Fixed supply · transparent token profile</strong>
        </div>
        <b>TESTNET BETA</b>
      </div>

      <div className="rabbit-factory-grid">
        <section className="rabbit-factory-card rabbit-factory-create">
          <div className="rabbit-factory-card-head">
            <div><Factory size={19} /><span>TOKEN DETAILS</span></div>
            <small>Chain ID 9280</small>
          </div>

          <label className="rabbit-factory-field">
            <span>TOKEN NAME</span>
            <input
              value={name}
              maxLength={64}
              placeholder="Rabbit Test Token"
              onChange={(event) => setName(event.target.value)}
            />
            <small>{name.length}/64</small>
          </label>

          <label className="rabbit-factory-field">
            <span>SYMBOL</span>
            <input
              value={symbol}
              maxLength={16}
              placeholder="RTT"
              onChange={(event) => setSymbol(event.target.value)}
            />
            <small>Stored as {normalizedSymbol || '—'}</small>
          </label>

          <label className="rabbit-factory-field">
            <span>TOTAL SUPPLY</span>
            <input
              inputMode="numeric"
              value={supply}
              placeholder="1000000"
              onChange={(event) => setSupply(event.target.value.replace(/[^\d,_\s]/g, ''))}
            />
            <small>Whole-token supply. The Factory applies the selected decimals.</small>
          </label>

          <div className="rabbit-factory-decimals">
            <span>DECIMALS</span>
            <div>
              {RABBIT_TOKEN_FACTORY_TESTNET.supportedDecimals.map((value) => (
                <button
                  type="button"
                  className={decimals === value ? 'active' : ''}
                  key={value}
                  onClick={() => setDecimals(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="rabbit-factory-profile">
            <Capability>Fixed supply</Capability>
            <Capability>Burnable</Capability>
            <Capability>No future mint</Capability>
            <Capability>No transfer tax</Capability>
            <Capability>No blacklist</Capability>
            <Capability>No proxy</Capability>
          </div>
        </section>

        <section className="rabbit-factory-card rabbit-factory-payment">
          <div className="rabbit-factory-card-head">
            <div><ShieldCheck size={19} /><span>CREATION FEE</span></div>
            <small>TWAP protected</small>
          </div>

          <div className="rabbit-factory-payment-tabs">
            <button
              type="button"
              className={payment === 'TRUSD' ? 'active' : ''}
              onClick={() => setPayment('TRUSD')}
            >
              <FactoryAssetName token={TRUSD_TOKEN} />
              <strong>100.00</strong>
              <small>Fixed</small>
            </button>
            <button
              type="button"
              className={payment === 'RAB' ? 'active' : ''}
              onClick={() => setPayment('RAB')}
            >
              <FactoryAssetName token={TRAB_TOKEN} />
              <strong>
                {feeStatus.oracleFresh && feeStatus.rabFee > 0n
                  ? `≈ ${formatCompactUnits(feeStatus.rabFee, 18, 6)}`
                  : 'TWAP refresh'}
              </strong>
              <small>{feeStatus.oracleFresh ? 'Oracle fresh' : 'Refreshes on creation'}</small>
            </button>
          </div>

          <div className="rabbit-factory-fee-meta">
            <div>
              <span><FactoryAssetName token={TRUSD_TOKEN} compact /> balance</span>
              <b>{formatCompactUnits(balances.trusd, 6, 4)}</b>
            </div>
            <div>
              <span><FactoryAssetName token={TRAB_TOKEN} compact /> balance</span>
              <b>{formatCompactUnits(balances.trab, 18, 6)}</b>
            </div>
            <div><span>Oracle</span><b className={feeStatus.oracleFresh ? 'fresh' : ''}>{feeStatus.oracleFresh ? 'FRESH' : 'STALE'}</b></div>
            <div>
              <span>Factory fee</span>
              <b className="rabbit-factory-fee-with-logo">
                <FactoryAssetLogo token={TRUSD_TOKEN} size="small" />
                100 tRUSD equivalent
              </b>
            </div>
          </div>

          <button
            type="button"
            className="rabbit-factory-action"
            disabled={actionDisabled}
            onClick={handleCreate}
          >
            {pending
              ? <RefreshCw className="spin" size={17} />
              : <Factory size={17} />}
            {actionLabel}
          </button>

          <p className="rabbit-factory-flow-note">
            One click in Rabbit Platform. Your wallet may request separate confirmations
            for approval, TWAP refresh and token creation because each is an on-chain transaction.
            Native tRAB creation sends a small maximum-value buffer; the contract charges the
            exact TWAP fee and refunds any excess.
          </p>
        </section>
      </div>

      {createdToken && (
        <section className="rabbit-factory-created">
          <div>
            <CheckCircle2 size={22} />
            <span>TOKEN CREATED</span>
            <h3>{createdToken.name} <em>{createdToken.symbol}</em></h3>
            <code>{createdToken.address}</code>
            <p>
              {createdToken.decimals} decimals · fixed supply · added to this browser's
              Rabbit Swap and Liquidity token list.
            </p>
          </div>
          <div className="rabbit-factory-created-actions">
            <button
              type="button"
              className="rabbit-factory-wallet-add"
              onClick={() => addTokenToWallet(createdToken)}
            >
              <Wallet size={13} /> Add to wallet
            </button>
            <a
              href={`${TESTNET.explorerUrl}/address/${createdToken.address}`}
              target="_blank"
              rel="noreferrer"
            >
              Explorer <ArrowUpRight size={13} />
            </a>
            <Link to="/platform/swap">Open Swap</Link>
            <Link to="/platform/liquidity">Add Liquidity</Link>
          </div>
        </section>
      )}

      <section className="rabbit-factory-registry">
        <div className="rabbit-factory-registry-head">
          <div><span>MY FACTORY TOKENS</span><strong>On-chain registry</strong></div>
          <button type="button" disabled={loading} onClick={refresh}>
            <RefreshCw className={loading ? 'spin' : ''} size={14} /> Refresh
          </button>
        </div>

        {connected && myTokens.length > 0 ? (
          <div className="rabbit-factory-token-list">
            {myTokens.map((token) => (
              <article key={token.address}>
                <div className="rabbit-factory-token-mark">{token.symbol.slice(0, 2)}</div>
                <span>
                  <b>{token.symbol}</b>
                  <small>{token.name}</small>
                </span>
                <em>{token.decimals} decimals</em>
                <button
                  type="button"
                  className="rabbit-factory-wallet-add compact"
                  onClick={() => addTokenToWallet(token)}
                  title={`Add ${token.symbol} to wallet`}
                >
                  <Wallet size={12} /> Add
                </button>
                <a
                  href={`${TESTNET.explorerUrl}/address/${token.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortAddress(token.address)} <ArrowUpRight size={11} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="rabbit-factory-empty">
            <span>{connected ? 'No tokens created by this wallet yet.' : 'Connect a wallet to see its Factory tokens.'}</span>
          </div>
        )}
      </section>

      <div className="rabbit-factory-contracts">
        <span>
          FACTORY
          <a
            href={`${TESTNET.explorerUrl}/address/${RABBIT_TOKEN_FACTORY_TESTNET.factory}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortAddress(RABBIT_TOKEN_FACTORY_TESTNET.factory)} <ArrowUpRight size={11} />
          </a>
        </span>
        <span>
          TWAP ORACLE
          <a
            href={`${TESTNET.explorerUrl}/address/${RABBIT_TOKEN_FACTORY_TESTNET.oracle}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortAddress(RABBIT_TOKEN_FACTORY_TESTNET.oracle)} <ArrowUpRight size={11} />
          </a>
        </span>
      </div>

      <p className="product-disclaimer">
        Rabbit Token Factory V1 creates community ERC-20 tokens on Rabbit Testnet.
        Factory-created does not mean audited or endorsed by Rabbit Chain. Tokens use a
        fixed initial supply, support burning and contain no future mint, transfer tax,
        blacklist or upgrade proxy. Testnet assets have no guaranteed monetary value.
      </p>
    </div>
  )
}
