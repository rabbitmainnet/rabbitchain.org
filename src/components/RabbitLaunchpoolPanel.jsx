import { useCallback, useEffect, useState } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  isAddress, parseUnits, formatUnits, zeroAddress
} from 'viem'
import { Flame, RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react'
import RabbitLaunchTradePanel from './RabbitLaunchTradePanel'
import RabbitLaunchCreatorPanel from './RabbitLaunchCreatorPanel'
import RabbitLaunchGraduationPanel from './RabbitLaunchGraduationPanel'
import {
  RABBIT_LAUNCHPOOL_TESTNET as CFG,
  RABBIT_LAUNCHPOOL_ABI as ABI
} from '../config/launchpool'
import { RABBIT_LAUNCHPOOL_V3 as V3, RABBIT_LAUNCHPOOL_V3_ABI as V3_ABI } from '../config/launchpool-v3'

const erc20 = [
  { type: 'function', name: 'decimals', stateMutability: 'view',
    inputs: [], outputs: [{type:'uint8'}] },
  { type: 'function', name: 'symbol', stateMutability: 'view',
    inputs: [], outputs: [{type:'string'}] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{type:'address'}], outputs: [{type:'uint256'}] },
  { type: 'function', name: 'allowance', stateMutability: 'view',
    inputs: [{type:'address'},{type:'address'}],
    outputs: [{type:'uint256'}] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable',
    inputs: [{type:'address'},{type:'uint256'}],
    outputs: [{type:'bool'}] },
]

const client = createPublicClient({
  transport: http(CFG.rpc, { timeout: 20000 })
})

function compact(a) {
  return a ? `${a.slice(0, 8)}…${a.slice(-6)}` : '—'
}

function present(v) {
  if (typeof v === 'bigint') return v.toString()
  if (Array.isArray(v)) return v.map(present)
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.entries(v).map(([k,x]) => [k,present(x)]))
  return v
}

export default function RabbitLaunchpoolPanel({
  walletState, walletProvider, onConnect, onSwitchNetwork
}) {
  const account = walletState?.account
  const correctChain = Number(walletState?.chainId) === CFG.chainId
  const [markets, setMarkets] = useState([])
  const [count, setCount] = useState(0)
  const [token, setToken] = useState('')
  const [inventory, setInventory] = useState('')
  const [startPrice, setStartPrice] = useState('')
  const [showLegacy, setShowLegacy] = useState(false)
  const [activeTab, setActiveTab] = useState('explore')
  const [payment, setPayment] = useState('native')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)

  const refresh = useCallback(async () => {
    const sources = [
      { version: 3, config: V3, abi: V3_ABI },
      { version: 2, config: CFG, abi: ABI }
    ]
    const results = await Promise.allSettled(sources.map(async source => {
      const n = await client.readContract({
        address: source.config.market, abi: source.abi.market,
        functionName: 'marketCount'
      })
      const total = Number(n)
      const first = Math.max(1, total - 49)
      const rows = []
      for (let id = first; id <= total; id++) {
        try {
          const [data, graduated] = await Promise.all([
            client.readContract({
              address: source.config.market, abi: source.abi.market,
              functionName: 'markets', args: [BigInt(id)]
            }),
            client.readContract({
              address: source.config.market, abi: source.abi.market,
              functionName: 'graduated', args: [BigInt(id)]
            })
          ])
          const getter = source.abi.market.find(
            x => x.type === 'function' && x.name === 'markets'
          )
          const fields = Object.fromEntries(
            getter.outputs.map((output, index) => [
              output.name || `field${index}`, present(data[index])
            ])
          )
          let symbol = 'TOKEN'
          let decimals = 18
          if (fields.token) {
            try {
              const [tokenSymbol, tokenDecimals] = await Promise.all([
                client.readContract({
                  address: fields.token, abi: erc20, functionName: 'symbol'
                }),
                client.readContract({
                  address: fields.token, abi: erc20, functionName: 'decimals'
                })
              ])
              symbol = tokenSymbol
              decimals = Number(tokenDecimals)
            } catch {}
          }
          rows.push({
            id, key: `${source.version}-${id}`, version: source.version,
            data: present(data), fields, symbol, decimals, graduated
          })
        } catch (error) {
          rows.push({
            id, key: `${source.version}-${id}`, version: source.version,
            error: error.shortMessage || error.message
          })
        }
      }
      return { total, rows: rows.reverse() }
    }))
    const rows = []
    let total = 0
    const failures = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        total += result.value.total
        rows.push(...result.value.rows)
      } else {
        failures.push(`V${sources[index].version}: ${result.reason?.shortMessage || result.reason?.message}`)
      }
    })
    setCount(total)
    setMarkets(rows)
    setMessage(failures.length ? `Some markets could not load. ${failures.join('; ')}` : '')
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function write(address, abi, functionName, args) {
    if (!account) throw Error('Connect your wallet')
    if (!correctChain) throw Error('Switch to Rabbit Testnet (9280)')
    if (!walletProvider?.request) throw Error('Wallet provider unavailable')
    const wallet = createWalletClient({ transport: custom(walletProvider) })
    const hash = await wallet.writeContract({
      account, address, abi, functionName, args,
      chain: null
    })
    const receipt = await client.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success')
      throw Error(`Transaction reverted: ${hash}`)
    return receipt
  }

  async function run(action) {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      await action()
      setMessage('Transaction confirmed on Rabbit Testnet.')
      await refresh()
      setMessage('Transaction confirmed on Rabbit Testnet.')
    } catch (e) {
      setMessage(e.shortMessage || e.message)
    } finally {
      setBusy(false)
    }
  }

  async function addTokenToWallet(address) {
    try {
      if (!account || !correctChain || !walletProvider?.request)
        throw Error('Connect a compatible wallet to Rabbit Testnet (9280)')

      if (!isAddress(address))
        throw Error('Invalid token address')

      const [symbol, decimals] = await Promise.all([
        client.readContract({
          address, abi: erc20, functionName: 'symbol'
        }),
        client.readContract({
          address, abi: erc20, functionName: 'decimals'
        })
      ])

      const accepted = await walletProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol,
            decimals: Number(decimals)
          }
        }
      })

      setMessage(accepted
        ? 'Token added to your wallet.'
        : 'Token addition was not confirmed.')
    } catch (error) {
      setMessage(error.shortMessage || error.message)
    }
  }

  async function ensureToken() {
    if (!isAddress(token)) throw Error('Enter a valid token address')
    const decimals = Number(await client.readContract({
      address: token, abi: erc20, functionName: 'decimals'
    }))
    if (![6,8,9,18].includes(decimals))
      throw Error('Supported token decimals: 6, 8, 9 or 18')
    return decimals
  }

  async function register(config = CFG, abi = ABI) {
    await ensureToken()
    const current = await client.readContract({
      address: config.registry, abi: abi.registry,
      functionName: 'launchIdOf', args: [token]
    })
    if (current !== 0n) throw Error('Token already registered')
    if (!account)
      throw Error('Connect your creator wallet first')

    const factory = '0x7edF729000e7fE79bf5De16B23f28b997dd5cD31'
    const factoryAbi = [
      {
        type: 'function',
        name: 'isFactoryToken',
        stateMutability: 'view',
        inputs: [{ name: 'token', type: 'address' }],
        outputs: [{ type: 'bool' }]
      },
      {
        type: 'function',
        name: 'creatorTokenCount',
        stateMutability: 'view',
        inputs: [{ name: 'creator', type: 'address' }],
        outputs: [{ type: 'uint256' }]
      },
      {
        type: 'function',
        name: 'getCreatorTokensPaginated',
        stateMutability: 'view',
        inputs: [
          { name: 'creator', type: 'address' },
          { name: 'start', type: 'uint256' },
          { name: 'limit', type: 'uint256' }
        ],
        outputs: [{ type: 'address[]' }]
      }
    ]

    const isFactoryToken = await client.readContract({
      address: factory, abi: factoryAbi,
      functionName: 'isFactoryToken', args: [token]
    })

    if (!isFactoryToken)
      throw Error('Only Rabbit Token Factory tokens can be registered')

    const total = await client.readContract({
      address: factory, abi: factoryAbi,
      functionName: 'creatorTokenCount', args: [account]
    })

    let creatorTokenIndex = null

    // Use index-by-index queries, matching the verified Factory API.
    // Stop as soon as the requested token is found.
    for (let i = 0n; i < total; i += 1n) {
      const tokens = await client.readContract({
        address: factory, abi: factoryAbi,
        functionName: 'getCreatorTokensPaginated',
        args: [account, i, 1n]
      })

      if (
        tokens.length === 1 &&
        tokens[0].toLowerCase() === token.toLowerCase()
      ) {
        creatorTokenIndex = i
        break
      }
    }

    if (creatorTokenIndex === null)
      throw Error('This token does not belong to the connected creator wallet')

    await write(
      config.registry,
      abi.registry,
      'registerLaunch',
      [token, creatorTokenIndex]
    )
  }

  async function create() {
    const decimals = await ensureToken()
    const amount = parseUnits(inventory, decimals)
    if (amount <= 0n) throw Error('Enter a positive inventory amount')

    const launchId = await client.readContract({
      address: CFG.registry, abi: ABI.registry,
      functionName: 'launchIdOf', args: [token]
    })
    if (launchId === 0n)
      throw Error('Register this token first')

    const balance = await client.readContract({
      address: token, abi: erc20,
      functionName: 'balanceOf', args: [account]
    })
    if (balance < amount) throw Error('Insufficient token balance')

    const allowance = await client.readContract({
      address: token, abi: erc20,
      functionName: 'allowance', args: [account, CFG.market]
    })
    if (allowance < amount) {
      setMessage('Approve token inventory in your wallet...')
      await write(token, erc20, 'approve', [CFG.market, amount])
    }

    setMessage('Confirm market creation in your wallet...')
    await write(
      CFG.market, ABI.market, 'createMarket',
      [token, payment === 'native' ? zeroAddress : CFG.tRUSD, amount]
    )
  }

  const v3Ready = Boolean(V3.market)
  const launchPreview = (() => {
    try {
      if (!/^\d+(?:\.\d+)?$/.test(inventory) || !Number(inventory)) return null
      // Preview uses decimal-independent display only; transaction uses token.decimals.
      const units = inventory.split('.')
      const precision = units[1]?.length || 0
      const full = BigInt(units[0] + (units[1] || ''))
      const lp = full / 5n
      const show = v => formatUnits(v, precision)
      return { sale: show(full - lp), lp: show(lp) }
    } catch { return null }
  })()

  async function launchV3() {
    if (!v3Ready) throw Error('V3 Market is not configured')
    if (!account) throw Error('Connect your creator wallet')
    const decimals = await ensureToken()
    const amount = parseUnits(inventory, decimals)
    const price = parseUnits(startPrice, 18)
    if (amount < 5n || price <= 0n || price > 10n ** 24n)
      throw Error('Check token quantity and starting price')
    const asset = payment === 'native' ? zeroAddress : V3.tRUSD
    const [registered, exists, balance] = await Promise.all([
      client.readContract({
        address: V3.registry, abi: V3_ABI.registry,
        functionName: 'launchIdOf', args: [token]
      }),
      client.readContract({
        address: V3.market, abi: V3_ABI.market,
        functionName: 'marketIdOf', args: [token, asset]
      }),
      client.readContract({
        address: token, abi: erc20,
        functionName: 'balanceOf', args: [account]
      })
    ])
    if (exists !== 0n) throw Error('V3 market already exists for this token and payment asset')
    if (balance < amount) throw Error('Insufficient token balance')
    if (registered === 0n) {
      setMessage('Step 1/3: Registering your Rabbit Token Factory token in V3...')
      await register(V3, V3_ABI)
    }
    const allowance = await client.readContract({
      address: token, abi: erc20, functionName: 'allowance',
      args: [account, V3.market]
    })
    if (allowance < amount) {
      setMessage('Step 2/3: Approve your token inventory for V3...')
      await write(token, erc20, 'approve', [V3.market, amount])
    }
    setMessage('Step 3/3: Confirm the complete launch in your wallet...')
    await write(V3.market, V3_ABI.market, 'launchSimple', [
      token, asset, amount, price, 0n
    ])
  }

  const walletAction = !account
    ? onConnect
    : !correctChain
      ? () => onSwitchNetwork?.({
          chainId: CFG.chainId,
          name: 'Rabbit Testnet',
          shortName: 'Rabbit Testnet'
        })
      : null

  const [marketSearch, setMarketSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState('all')

  const freshMarkets = markets.filter(m => m.version === 3)
  const legacyMarkets = markets.filter(m => m.version === 2)
  const visibleMarkets = showLegacy ? legacyMarkets : freshMarkets
  const myLaunches = freshMarkets.filter(m => account && m.fields?.creator?.toLowerCase() === account.toLowerCase())
  const activeMarkets = freshMarkets.filter(
    m => m.fields?.active && !m.graduated
  ).length

  const matchingMarkets = (activeTab === 'mine' ? myLaunches : visibleMarkets).filter(m => {
    const state = m.graduated ? 'graduated'
      : m.fields?.active ? 'active' : 'pending'
    if (marketFilter !== 'all' && marketFilter !== state) return false
    const q = marketSearch.toLowerCase().trim()
    return !q || [
      String(m.id), `v${m.version}`, m.symbol, m.fields?.token,
      m.fields?.creator
    ].some(v => String(v || '').toLowerCase().includes(q))
  })

  function amountDisplay(value, decimals = 18) {
    try {
      return Number(formatUnits(BigInt(value || 0), decimals))
        .toLocaleString('en-US', { maximumFractionDigits: 6 })
    } catch { return '—' }
  }

  return (
    <div className="product-panel rabbit-launchpool-panel rabbit-lp-v2">

      <section className="rlp-hero">
        <div className="rlp-hero-copy">
          <div className="rlp-eyebrow">✦ RABBIT LAUNCHPOOL</div>
          <h1>Launch permissionless token markets on
            <span> Rabbit Chain.</span>
          </h1>
          <div className="rlp-tag">TESTNET 9280</div>
          <p>
            Explore on-chain token launches, transparent bonding-curve trading
            and RabbitSwap graduation with permanently locked initial liquidity.
          </p>
          <div className="rlp-features">
            <div><b>◈</b><span><strong>Permissionless</strong>
              <small>Open token launches</small></span></div>
            <div><b>ϟ</b><span><strong>On-chain Markets</strong>
              <small>Transparent pricing</small></span></div>
            <div><b>♧</b><span><strong>Permanent LP</strong>
              <small>Locked liquidity</small></span></div>
          </div>
        </div>
        <div className="rlp-art-new" aria-label="Rabbit Chain">
          <div className="rlp-art-glow"></div>
          <div className="rlp-art-ring ring-one"></div>
          <div className="rlp-art-ring ring-two"></div>

          <div className="rlp-art-small-token small-one">
            <img src="/rabbit-mark.png" alt="" />
          </div>

          <div className="rlp-art-small-token small-two">
            <img src="/rabbit-mark.png" alt="" />
          </div>

          <div className="rlp-art-pedestal">
            <div className="rlp-art-pedestal-top"></div>
          </div>

          <div className="rlp-art-main-token">
            <div className="rlp-art-main-face">
              <img src="/rabbit-mark.png" alt="Rabbit Chain" />
            </div>
          </div>
        </div>
      </section>

      <nav className="rlp-clean-tabs" aria-label="Launchpool navigation">
        <button className={activeTab === 'explore' ? 'chosen' : ''} onClick={() => {setActiveTab('explore'); setShowLegacy(false)}} type="button">Explore launches</button>
        <button className={activeTab === 'create' ? 'chosen' : ''} onClick={() => setActiveTab('create')} type="button">+ Create launch</button>
        <button className={activeTab === 'mine' ? 'chosen' : ''} onClick={() => {setActiveTab('mine'); setShowLegacy(false)}} type="button">My launches</button>
      </nav>

      {activeTab === 'create' && <section className="rlp-section rlp-create" id="rabbit-launch-form">
        <div className="rlp-heading">
          <div>
            <h2><span className="rlp-plus">+</span> Create a Launch</h2>
            <p>Set your token, supply and starting price. We prepare the rest.</p>
          </div>
          <span className="rlp-test-label">RABBIT TESTNET · 9280</span>
        </div>
        {!v3Ready && <p className="rlp-v3-notice" role="status">
          <strong>V3 launch is being prepared.</strong> This preview does not send tokens.
          The existing V2 markets remain accessible below. Launching with V3 will
          be enabled only after its new Market contract is deployed and checked.
        </p>}
        {walletAction && <button className="rlp-primary rlp-connect" type="button"
          onClick={walletAction}>
          {!account ? 'Connect wallet' : 'Switch to Rabbit Testnet'}
        </button>}
        <div className="rlp-form-grid">
          <label className="rlp-token-field">
            <span>1 · Your token address</span>
            <input value={token} onChange={e => setToken(e.target.value.trim())}
              placeholder="0x..." spellCheck="false" autoComplete="off" />
            <small>Created with Rabbit Token Factory, using your connected creator wallet.</small>
          </label>
          <label>
            <span>2 · Total tokens to launch</span>
            <input value={inventory} onChange={e => setInventory(e.target.value.trim())}
              placeholder="1000000000" inputMode="decimal" />
            <small>Any supported token amount within on-chain arithmetic and your balance.</small>
          </label>
          <label>
            <span>3 · Starting price per token</span>
            <input value={startPrice} onChange={e => setStartPrice(e.target.value.trim())}
              placeholder="0.000001" inputMode="decimal" />
            <small>Quoted in the selected payment token. Fixed initial curve (slope 0).</small>
          </label>
          <div className="rlp-payment-field">
            <span>Payment asset</span>
            <div className="rlp-payment-options">
              <button type="button" className={payment === 'native' ? 'chosen' : ''}
                onClick={() => setPayment('native')}>
                <img className="rlp-real-token-logo" src="/testnet-assets/trab.png" alt="" />
                <span><strong>tRAB</strong><small>Native Rabbit</small></span>
              </button>
              <button type="button" className={payment === 'trusd' ? 'chosen' : ''}
                onClick={() => setPayment('trusd')}>
                <img className="rlp-real-token-logo" src="/launchpool-assets/trusd.png" alt="" />
                <span><strong>tRUSD</strong><small>Testnet USD</small></span>
              </button>
            </div>
          </div>
        </div>
        <div className="rlp-v3-preview" aria-live="polite">
          <h3>Your launch at a glance</h3>
          <div className="rlp-v3-distribution"><span>80% · Bonding-curve sale</span>
            <strong>{launchPreview?.sale || '—'}</strong></div>
          <div className="rlp-v3-distribution"><span>20% · Permanent LP inventory</span>
            <strong>{launchPreview?.lp || '—'}</strong></div>
          <div className="rlp-v3-bar"><span /><span /></div>
          <p>After the sale goal is reached, anyone can complete graduation to RabbitSwap. The initial LP is permanently locked.</p>
        </div>
        <div className="rlp-form-actions">
          <button type="button" className="rlp-primary"
            disabled={busy || !account || !correctChain || !v3Ready || !launchPreview || !startPrice}
            onClick={() => run(launchV3)}>
            {busy ? 'Processing…' : 'Launch Token →'}
          </button>
        </div>
        <p className="rlp-footnote">Registration (when required) and ERC-20 approval
          are separate wallet transactions. Market creation, price configuration,
          80/20 allocation and activation occur in one on-chain V3 transaction.
          Graduation itself requires another permissionless transaction when the target is met.</p>

      </section>}

      {activeTab === 'create' && <section className="rlp-section rlp-v3-guide" id="rabbit-launch-guide">
        <div className="rlp-heading"><div><h2>◈ How Rabbit Launchpool Works</h2>
          <p>A simple, transparent process for creators and traders.</p></div></div>
        <div className="rlp-v3-steps">
          <article><b>01</b><h3>Create your token</h3><p>Create a compatible ERC-20 token
            with Rabbit Token Factory. The connected wallet must be its creator.</p></article>
          <article><b>02</b><h3>Choose your launch</h3><p>Enter the total tokens,
            starting price and tRAB or tRUSD payment currency. Review the 80/20 split.</p></article>
          <article><b>03</b><h3>Approve & launch</h3><p>Approve the token transfer.
            The V3 Market configures the sale and graduation in one launch transaction.</p></article>
          <article><b>04</b><h3>Trade & graduate</h3><p>Buyers purchase or sell on the curve.
            After the sales target, anyone can trigger graduation to RabbitSwap.</p></article>
        </div>
        <h3>Frequently Asked Questions</h3>
        <div className="rlp-v3-faq">
          <details><summary>What happens to the initial liquidity?</summary><p>
            On successful graduation, the LP tokens for the initial RabbitSwap
            liquidity are sent to the permanent LP lock and cannot be withdrawn.</p></details>
          <details><summary>Can I launch one billion or one trillion tokens?</summary><p>
            V3 local tests include one-trillion-token inventory and graduation.
            Actual deposits depend on your wallet balance, token decimals,
            contract limits and the chosen price.</p></details>
          <details><summary>Does graduation happen automatically?</summary><p>
            The on-chain graduation is permissionless after the sales goal is reached,
            but it still requires someone to submit a transaction and a clean,
            compatible RabbitSwap pair. A failed graduation leaves the market
            reserves intact when the transaction reverts.</p></details>
          <details><summary>What fees and risks should I know?</summary><p>
            The Market uses a 1% trade fee, plus network transaction gas.
            Bonding-curve prices and token values can change. Initial LP locking
            does not guarantee a token's safety, future liquidity or value.
            Testnet tokens have no guaranteed monetary value.</p></details>
          <details><summary>Can I cancel or recover tokens?</summary><p>
            V3 supports cancellation of a pending market under contract conditions;
            activated markets have different rules. The legacy V2 contract has
            no equivalent pending-market cancellation. Review all transactions
            and contract addresses before approval.</p></details>
        </div>
      </section>}

      {activeTab !== 'create' && <section className="rlp-section rlp-market-section">
        <div className="rlp-heading rlp-market-toolbar">
          <div>
            <h2>{activeTab === 'mine' ? 'My Launches' : showLegacy ? 'Previous Launches' : 'Discover Launches'}</h2>
            <p>{showLegacy ? 'Older markets remain accessible for existing holders.' : 'Explore live launches and trade directly on Rabbit Chain.'}</p>
          </div>
          <div className="rlp-toolbar-actions">
            <input aria-label="Search markets"
              placeholder="Search token, symbol or address..."
              value={marketSearch}
              onChange={e => setMarketSearch(e.target.value)} />
            <select aria-label="Filter markets"
              value={marketFilter}
              onChange={e => setMarketFilter(e.target.value)}>
              <option value="all">All markets</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="graduated">Graduated</option>
            </select>
            <button type="button" onClick={refresh}
              disabled={busy}>↻ Refresh</button>
          </div>
        </div>

        <div className="rlp-clean-market-grid">
          {matchingMarkets.map(item => {
            const f = item.fields || {}
            const dec = item.decimals || 18
            const asset = f.paymentAsset?.toLowerCase() === zeroAddress ? 'tRAB' : 'tRUSD'
            const total = BigInt(f.inventory || 0) + BigInt(f.sold || 0)
            const sold = BigInt(f.sold || 0)
            const progress = total > 0n ? Math.min(100, Number(sold * 10000n / total) / 100) : 0
            const status = item.graduated ? 'Graduated' : f.active ? 'Live' : 'Preparing'
            return <article className="rlp-clean-market-card" key={item.key}>
              <div className="rlp-clean-card-head">
                <div className="rlp-token">
                  <span className="rlp-token-avatar">{String(item.symbol || 'R')[0]}</span>
                  <span><strong>{item.symbol || 'TOKEN'}</strong><small>{compact(f.token)}</small></span>
                </div>
                <span className={'rlp-status ' + (item.graduated ? 'graduated' : f.active ? 'active' : 'pending')}>{status}</span>
              </div>
              <div className="rlp-clean-card-stats">
                <div><small>Sold</small><strong>{amountDisplay(f.sold, dec)}</strong></div>
                <div><small>Raised</small><strong>{amountDisplay(f.reserve, asset === 'tRAB' ? 18 : 6)} {asset}</strong></div>
              </div>
              <div className="rlp-clean-progress-label"><span>Launch progress</span><strong>{progress.toFixed(1)}%</strong></div>
              <div className="rlp-progress"><div><span style={{width: `${progress}%`}} /></div></div>
              <button type="button" className="rlp-primary rlp-clean-card-button"
                onClick={() => setSelected(selected === item.key ? null : item.key)}>
                {selected === item.key ? 'Close details' : item.graduated ? 'View launch' : f.active ? 'Trade token →' : 'View details →'}
              </button>
            </article>
          })}
        </div>
        {matchingMarkets.length === 0 && (
          <div className="rlp-empty">
            <div>◇</div>
            <h3>{count === 0
              ? 'The first launch starts here'
              : 'No matching markets'}</h3>
            <p>{count === 0
              ? 'No markets have been created on Rabbit Testnet yet.'
              : 'Try changing the search or status filter.'}</p>
          </div>
        )}

        {(activeTab === 'mine' ? myLaunches : visibleMarkets).filter(item => selected === item.key).map(item => (
          <div key={item.key} className="rlp-details">
            <div className="rlp-heading">
              <h2>{item.symbol || 'Token'} · V{item.version} Market #{item.id}</h2>
              <button type="button" onClick={() => setSelected(null)}>
                Close ×
              </button>
            </div>
            <button type="button" className="rlp-secondary"
              disabled={!account || !correctChain || !item.fields?.token}
              onClick={() => addTokenToWallet(item.fields.token)}>
              + Add Token to Wallet
            </button>
            {item.fields?.token && item.fields?.basePrice && (
              <RabbitLaunchTradePanel
                item={item}
                walletState={walletState}
                walletProvider={walletProvider}
                onRefresh={refresh}
              />
            )}
            {item.version === 3 ? (
              <RabbitLaunchGraduationPanel
                item={item}
                walletState={walletState}
                walletProvider={walletProvider}
                onRefresh={refresh}
              />
            ) : (
              <RabbitLaunchCreatorPanel
                item={item}
                walletState={walletState}
                walletProvider={walletProvider}
                onRefresh={refresh}
              />
            )}
            <a className="rlp-text-link"
              href={`${CFG.explorer}/address/${item.fields?.token || (item.version === 3 ? V3.market : CFG.market)}`}
              target="_blank" rel="noreferrer">
              View token on Rabbit Explorer ↗
            </a>
          </div>
        ))}
      </section>}

      {activeTab !== 'create' && <div className="rlp-clean-footer-tools">
        <details>
          <summary>Previous launches & contract information</summary>
          <p>Older markets are kept separate. Their funds and on-chain contracts have not been deleted.</p>
          <button type="button" className="rlp-secondary" onClick={() => {setShowLegacy(!showLegacy); setSelected(null); setActiveTab('explore')}}>
            {showLegacy ? 'Return to current launches' : 'View previous markets'}
          </button>
          <div className="rlp-clean-contract-links">
            <a href={`${CFG.explorer}/address/${V3.market}`} target="_blank" rel="noreferrer">Current market contract ↗</a>
            <a href={`${CFG.explorer}/address/${CFG.market}`} target="_blank" rel="noreferrer">Previous market contract ↗</a>
          </div>
        </details>
      </div>}

      {message && <p className="rlp-message" role="status">{message}</p>}
      <p className="rlp-bottom-note">
        RABBIT TESTNET ONLY · Chain ID 9280 · Test tokens have no
        guaranteed monetary value. Mainnet trading is not available.
      </p>
    </div>
  )
}
