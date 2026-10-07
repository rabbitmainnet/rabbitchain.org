import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Droplets,
  Factory,
  Flame,
  Network,
  Repeat2,
  Rocket,
  Search,
  ShieldCheck,
  Wallet,
  Waves,
} from 'lucide-react'
import {
  decodeEventLog,
  decodeFunctionResult,
  encodeFunctionData,
  formatEther,
  keccak256,
  toHex,
} from 'viem'
import { NETWORKS } from '../config/networks'
import { RABBIT_VRF } from '../config/vrf'
import PlatformNetworkSwitch from '../components/PlatformNetworkSwitch'

const DEV_QUICKSTART = "import {\n  createPublicClient, createWalletClient, custom, http,\n  defineChain, parseAbi, decodeEventLog,\n} from 'viem';\n\nconst rabbit = defineChain({\n  id: 9280, name: 'Rabbit Testnet',\n  nativeCurrency: { name: 'Test Rabbit', symbol: 'tRAB', decimals: 18 },\n  rpcUrls: { default: { http: ['https://rpc-testnet.rabbitchain.org'] } },\n});\nconst coordinator = '0xdfc21aea108e3f527e5f236ebf354dc8262719da';\nconst abi = parseAbi([\n  'function quoteRequestFee(uint32 callbackGasLimit) view returns (uint256)',\n  'function requestRandomness(uint32 callbackGasLimit, bytes32 appDataHash) payable returns (bytes32)',\n  'function getRequest(bytes32 requestId) view returns (address requester, uint64 requesterNonce, uint64 requestBlock, uint64 epoch, uint64 round, uint32 callbackGasLimit, uint256 feePaid, bytes32 appDataHash, bytes32 randomness, bytes32 proofHash, uint8 status)',\n  'event RandomnessRequested(bytes32 indexed requestId, address indexed requester, uint64 indexed requesterNonce, uint32 callbackGasLimit, bytes32 appDataHash, uint256 feePaid)',\n]);\nconst client = createPublicClient({ chain: rabbit, transport: http() });\n\n// Call from a user gesture, after selecting Rabbit Testnet in the wallet.\nexport async function submitVrf(appDataHash = `0x${'00'.repeat(32)}`) {\n  if (!window.ethereum) throw new Error('Connect an EVM wallet first');\n  const wallet = createWalletClient({ chain: rabbit, transport: custom(window.ethereum) });\n  const [account] = await wallet.requestAddresses();\n  if (await wallet.getChainId() !== rabbit.id) throw new Error('Switch to Rabbit Testnet');\n  const fee = await client.readContract({ address: coordinator, abi,\n    functionName: 'quoteRequestFee', args: [0] });\n  const hash = await wallet.writeContract({ account, address: coordinator, abi,\n    functionName: 'requestRandomness', args: [0, appDataHash], value: fee });\n  // Persist hash immediately; a timeout is not proof of failure.\n  return { hash, account };\n}\n\nexport async function recoverRequest(hash) {\n  const receipt = await client.getTransactionReceipt({ hash });\n  if (receipt.status !== 'success') throw new Error('Request transaction reverted');\n  for (const log of receipt.logs) {\n    if (log.address.toLowerCase() !== coordinator) continue;\n    try {\n      const event = decodeEventLog({ abi, data: log.data, topics: log.topics });\n      if (event.eventName === 'RandomnessRequested') return event.args.requestId;\n    } catch { /* Ignore other coordinator events. */ }\n  }\n  throw new Error('No request event in this receipt');\n}\n\nexport async function readVrf(requestId) {\n  const value = await client.readContract({ address: coordinator, abi,\n    functionName: 'getRequest', args: [requestId] });\n  return { requester: value[0], requestBlock: value[2], feePaid: value[6],\n    randomness: value[8], proofHash: value[9], status: Number(value[10]) };\n}\n// Poll readVrf(requestId) with backoff until status === 2.\n// On RPC errors, retain hash/requestId and retry; do not submit again.\n"

const ZERO_HASH = `0x${'00'.repeat(32)}`

const VRF_PLATFORM_NAV = [
  { key: 'swap', title: 'Rabbit Swap', icon: Repeat2, to: '/platform/swap' },
  { key: 'liquidity', title: 'Liquidity', icon: Waves, to: '/platform/liquidity' },
  { key: 'factory', title: 'Token Factory', icon: Factory, to: '/platform/factory' },
  { key: 'launchpool', title: 'Launchpool', icon: Flame, to: '/platform/launchpool' },
  { key: 'vrf', title: 'Rabbit VRF', icon: ShieldCheck, to: '/vrf' },
  { key: 'faucet', title: 'Faucet', icon: Droplets, to: '/platform/faucet' },
]

const VRF_ABI = [
  {
    type: 'function',
    name: 'quoteRequestFee',
    stateMutability: 'view',
    inputs: [{ name: 'callbackGasLimit', type: 'uint32' }],
    outputs: [{ name: 'fee', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nextRequestNonce',
    stateMutability: 'view',
    inputs: [{ name: 'requester', type: 'address' }],
    outputs: [{ name: 'nonce', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'getRequest',
    stateMutability: 'view',
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    outputs: [
      { name: 'requester', type: 'address' },
      { name: 'requesterNonce', type: 'uint64' },
      { name: 'requestBlock', type: 'uint64' },
      { name: 'epoch', type: 'uint64' },
      { name: 'round', type: 'uint64' },
      { name: 'callbackGasLimit', type: 'uint32' },
      { name: 'feePaid', type: 'uint256' },
      { name: 'appDataHash', type: 'bytes32' },
      { name: 'randomness', type: 'bytes32' },
      { name: 'proofHash', type: 'bytes32' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    type: 'function',
    name: 'requestRandomness',
    stateMutability: 'payable',
    inputs: [
      { name: 'callbackGasLimit', type: 'uint32' },
      { name: 'appDataHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'requestId', type: 'bytes32' }],
  },
  {
    type: 'event',
    name: 'RandomnessRequested',
    anonymous: false,
    inputs: [
      { name: 'requestId', type: 'bytes32', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'requesterNonce', type: 'uint64', indexed: true },
      { name: 'callbackGasLimit', type: 'uint32', indexed: false },
      { name: 'appDataHash', type: 'bytes32', indexed: false },
      { name: 'feePaid', type: 'uint256', indexed: false },
    ],
  },
]

async function rpc(method, params = [], provider = null) {
  if (provider?.request) {
    return provider.request({ method, params })
  }

  const response = await fetch(NETWORKS.testnet.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  })

  if (!response.ok) throw new Error('Rabbit RPC is temporarily unavailable. Please try again.')
  const payload = await response.json()

  if (payload.error) {
    throw new Error(payload.error.message || 'Rabbit RPC request failed')
  }

  return payload.result
}

async function readCoordinator(functionName, args = [], provider = null) {
  const data = encodeFunctionData({
    abi: VRF_ABI,
    functionName,
    args,
  })

  const result = await rpc(
    'eth_call',
    [{ to: RABBIT_VRF.coordinator, data }, 'latest'],
    provider,
  )

  return decodeFunctionResult({
    abi: VRF_ABI,
    functionName,
    data: result,
  })
}

function chainNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') {
    return Number.parseInt(value, value.startsWith('0x') ? 16 : 10)
  }
  return null
}

function shortHex(value, left = 10, right = 8) {
  if (!value) return '—'
  if (value.length <= left + right + 1) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}

function nativeAmount(value) {
  if (value === null || value === undefined) return '—'
  const text = formatEther(BigInt(value))
  const [whole, fraction = ''] = text.split('.')
  const trimmed = fraction.slice(0, 8).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

function statusName(value) {
  const status = Number(value)
  if (status === 0) return 'NOT FOUND'
  if (status === 2) return 'FULFILLED'
  return 'PENDING'
}

function requestIdFromReceipt(receipt) {
  let emittedRequestId = ''

      for (const log of receipt.logs || []) {
        if (String(log.address).toLowerCase() !== RABBIT_VRF.coordinator.toLowerCase()) continue

        try {
          const decoded = decodeEventLog({
            abi: VRF_ABI,
            data: log.data,
            topics: log.topics,
          })

          if (decoded.eventName === 'RandomnessRequested') {
            emittedRequestId = decoded.args.requestId
            break
          }
        } catch {
          // Ignore unrelated coordinator logs.
        }
      }

  return emittedRequestId
}

export default function Vrf({
  walletState,
  walletProvider,
  onConnect,
  onAddNetwork,
  toast,
}) {
  const [activeTab, setActiveTab] = useState('requests')
  const [feeWei, setFeeWei] = useState(null)
  const [feeError, setFeeError] = useState('')
  const [appDataHash, setAppDataHash] = useState(ZERO_HASH)
  const [requestId, setRequestId] = useState('')
  const [request, setRequest] = useState(null)
  const [inspectError, setInspectError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [trackedId, setTrackedId] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [requestTimestamp, setRequestTimestamp] = useState(null)
  const [clock, setClock] = useState(Date.now())
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyProgress, setHistoryProgress] = useState('')
  const [historyFilter, setHistoryFilter] = useState('all')
  const historySequence = useRef(0)
  const inspectionSequence = useRef(0)

  async function loadHistory() {
    const sequence = ++historySequence.current
    const account = walletState?.account
    if (!account) return
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const head = Number(BigInt(await rpc('eth_blockNumber')))
      const topic = keccak256(toHex('RandomnessRequested(bytes32,address,uint64,uint32,bytes32,uint256)'))
      const walletTopic = `0x${account.slice(2).toLowerCase().padStart(64, '0')}`
      const found = new Map()
      for (let end = head; end >= RABBIT_VRF.activationBlock; end -= 1000) {
        if (sequence !== historySequence.current) return
        const start = Math.max(RABBIT_VRF.activationBlock, end - 999)
        setHistoryProgress(`Reading blocks ${start.toLocaleString()}–${end.toLocaleString()}`)
        const logs = await rpc('eth_getLogs', [{
          address: RABBIT_VRF.coordinator,
          fromBlock: toHex(start), toBlock: toHex(end),
          topics: [topic, null, walletTopic],
        }])
        for (const log of logs) {
          if (log.removed) continue
          const event = decodeEventLog({abi: VRF_ABI, data: log.data, topics: log.topics})
          if (event.args.requester.toLowerCase() !== account.toLowerCase()) continue
          found.set(event.args.requestId, {id: event.args.requestId, tx: log.transactionHash,
            block: Number(BigInt(log.blockNumber)), fee: event.args.feePaid, status: null})
        }
        if (sequence === historySequence.current) setHistory([...found.values()].sort((a,b) => b.block-a.block))
      }
      const rows = [...found.values()].sort((a,b) => b.block-a.block)
      // Bound concurrency for the public RPC; every row is confirmed against current state.
      for (let start = 0; start < rows.length; start += 4) {
        const batch = await Promise.all(rows.slice(start, start+4).map(async row => {
          const value = await readCoordinator('getRequest', [row.id])
          return {...row, status: Number(value[10]), randomness: value[8], proofHash: value[9]}
        }))
        rows.splice(start, batch.length, ...batch)
        if (sequence !== historySequence.current) return
        setHistory([...rows])
      }
      setHistoryProgress(`Wallet history checked through block ${head.toLocaleString()}`)
    } catch (error) {
      if (sequence === historySequence.current) setHistoryError(error?.message || 'Could not load wallet history. Please retry.')
    } finally {
      if (sequence === historySequence.current) setHistoryLoading(false)
    }
  }

  useEffect(() => {
    setHistory([])
    setHistoryError('')
    setHistoryProgress('')
    setHistoryLoading(false)
    if (walletState?.account) loadHistory()
    return () => { historySequence.current += 1 }
  }, [walletState?.account])

  useEffect(() => {
    if (!history.some(row => row.status === 1)) return
    let cancelled = false
    let busy = false
    const timer = setInterval(async () => {
      if (busy) return
      busy = true
      try {
        const updates = await Promise.all(history.filter(row => row.status === 1).map(async row => {
          const value = await readCoordinator('getRequest', [row.id])
          return {...row, status: Number(value[10]), randomness: value[8], proofHash: value[9]}
        }))
        if (!cancelled) setHistory(current => current.map(row => updates.find(value => value.id === row.id) || row))
      } catch { /* Preserve rows and retry pending requests next cycle. */ }
      finally { busy = false }
    }, 15000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [history])

  async function copyValue(value) {
    try {
      await navigator.clipboard.writeText(value)
      toast?.('Copied to clipboard.')
    } catch { toast?.('Copy unavailable. Select and copy the value below.') }
  }

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      const savedTransaction = localStorage.getItem('rabbit-vrf-last-transaction')
      if (/^0x[0-9a-fA-F]{64}$/.test(savedTransaction || '')) setTransactionHash(savedTransaction)
      const saved = localStorage.getItem('rabbit-vrf-last-request')
      if (/^0x[0-9a-fA-F]{64}$/.test(saved || '')) {
        setRequestId(saved)
        inspect(saved)
      }
    } catch { /* Storage is optional. */ }
    return () => { inspectionSequence.current += 1 }
  }, [])

  useEffect(() => {
    if (!trackedId || request?.requestId !== trackedId || Number(request?.status) !== 1) return undefined
    let busy = false
    const timer = setInterval(async () => {
      if (busy) return
      busy = true
      try { await inspect(trackedId) } finally { busy = false }
    }, 10000)
    return () => clearInterval(timer)
  }, [trackedId, request?.requestId, request?.status])

  const connected = Boolean(walletState?.account)
  const correctNetwork = chainNumber(walletState?.chainId) === NETWORKS.testnet.chainId

  async function refreshFee() {
    try {
      setFeeError('')
      const fee = await readCoordinator('quoteRequestFee', [0])
      setFeeWei(BigInt(fee))
    } catch (error) {
      setFeeWei(null)
      setFeeError(error?.message || 'Pricing currently unavailable')
    }
  }

  useEffect(() => {
    refreshFee()
    const timer = setInterval(refreshFee, 30000)
    return () => clearInterval(timer)
  }, [])

  async function inspect(id = requestId) {
    const clean = String(id || '').trim()

    if (!/^0x[0-9a-fA-F]{64}$/.test(clean)) {
      inspectionSequence.current += 1
      setTrackedId('')
      setRequestTimestamp(null)
      setInspectError('Enter a valid bytes32 Rabbit VRF request ID.')
      setRequest(null)
      return
    }

    const sequence = ++inspectionSequence.current
    setTrackedId(clean)
    if (request?.requestId !== clean) { setRequest(null); setRequestTimestamp(null) }
    try {
      setInspectError('')

      const result = await readCoordinator('getRequest', [clean])

      const [
        requester,
        requesterNonce,
        requestBlock,
        epoch,
        round,
        callbackGasLimit,
        feePaid,
        storedAppDataHash,
        randomness,
        proofHash,
        status,
      ] = result

      if (sequence !== inspectionSequence.current) return
      try { localStorage.setItem('rabbit-vrf-last-request', clean) } catch { /* Optional. */ }
      setRequest({
        requestId: clean,
        requester,
        requesterNonce,
        requestBlock,
        epoch,
        round,
        callbackGasLimit,
        feePaid,
        appDataHash: storedAppDataHash,
        randomness,
        proofHash,
        status,
      })
      setRequestTimestamp(null)
      if (Number(status) !== 0) {
        try {
          const block = await rpc('eth_getBlockByNumber', [`0x${BigInt(requestBlock).toString(16)}`, false])
          if (sequence === inspectionSequence.current && block) {
            setRequestTimestamp(Number(BigInt(block.timestamp)) * 1000)
          }
        } catch { /* Request state remains usable without timestamps. */ }
      }
    } catch (error) {
      if (sequence !== inspectionSequence.current) return
      setInspectError(error?.message || 'Unable to read this request.')
      // Keep the last successful pending state so automatic retries continue.
    }
  }

  async function waitForReceipt(hash) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const receipt = await rpc('eth_getTransactionReceipt', [hash], walletProvider)
      if (receipt) return receipt
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    throw new Error('Transaction submitted, but the receipt is still pending.')
  }

  async function recoverRequest() {
    try {
      const receipt = await rpc('eth_getTransactionReceipt', [transactionHash])
      if (!receipt) { toast?.('Transaction is still pending. Try again shortly.'); return }
      if (chainNumber(receipt.status) !== 1) throw new Error('Transaction reverted. No VRF request was created.')
      const id = requestIdFromReceipt(receipt)
      if (!id) throw new Error('No Rabbit VRF request event was found in this transaction.')
      setRequestId(id)
      await inspect(id)
      loadHistory()
    } catch (error) { toast?.(error?.message || 'Unable to recover the request ID.') }
  }

  async function submitRequest() {
    if (!connected) {
      onConnect?.()
      return
    }

    if (!correctNetwork) {
      onAddNetwork?.(NETWORKS.testnet)
      return
    }

    if (!RABBIT_VRF.publicRequestsLive) {
      toast?.('Rabbit VRF request submission remains locked until playground validation is complete.')
      return
    }

    if (!/^0x[0-9a-fA-F]{64}$/.test(appDataHash)) {
      toast?.('App data hash must be a bytes32 value.')
      return
    }

    try {
      setSubmitting(true)

      const quotedFee = await readCoordinator(
        'quoteRequestFee',
        [0],
        walletProvider,
      )

      const data = encodeFunctionData({
        abi: VRF_ABI,
        functionName: 'requestRandomness',
        args: [0, appDataHash],
      })

      const hash = await rpc(
        'eth_sendTransaction',
        [{
          from: walletState.account,
          to: RABBIT_VRF.coordinator,
          data,
          value: `0x${BigInt(quotedFee).toString(16)}`,
        }],
        walletProvider,
      )

      setTransactionHash(hash)
      try { localStorage.setItem('rabbit-vrf-last-transaction', hash) } catch { /* Optional. */ }
      toast?.('Rabbit VRF request submitted. Waiting for receipt.')

      const receipt = await waitForReceipt(hash)
      if (chainNumber(receipt.status) !== 1) throw new Error('Transaction reverted. No VRF request was created.')

      const emittedRequestId = requestIdFromReceipt(receipt)

      if (!emittedRequestId) {
        throw new Error('Transaction confirmed, but RandomnessRequested was not found.')
      }

      setRequestId(emittedRequestId)
      await inspect(emittedRequestId)
      loadHistory()
      toast?.('Request transaction confirmed. Randomness may still be pending.')
    } catch (error) {
      toast?.(error?.message || 'Rabbit VRF request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const buttonLabel = !connected
    ? 'Connect wallet'
    : !correctNetwork
      ? 'Switch to Rabbit Testnet'
      : !RABBIT_VRF.publicRequestsLive
        ? 'Request testing opens after validation'
        : submitting
          ? 'Submitting request…'
          : 'Request randomness'

  return (
    <main className="vrf-workspace-clean">
      <section className="vrf-platform-toolbar">
        <div className="vrf-platform-toolbar-inner">
          <nav aria-label="Rabbit Platform">
            {VRF_PLATFORM_NAV.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={item.key === 'vrf' ? 'active' : ''}
                >
                  <Icon size={15} />
                  {item.title}
                </Link>
              )
            })}

          </nav>

          <div className="vrf-toolbar-network-switch">
            <PlatformNetworkSwitch
              value="testnet"
              onChange={(key) => {
                if (key === 'testnet') {
                  onAddNetwork?.(NETWORKS.testnet)
                } else {
                  toast?.('Rabbit VRF is available on Testnet only. Mainnet has not launched.')
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="platform-v2-hero vrf-v2-hero">
        <div className="shell platform-v2-hero-grid">
          <div className="platform-v2-copy">
            <span className="hero-eyebrow"><i /> RABBIT VRF · TESTNET LIVE</span>

            <h1>
              Verifiable randomness.
              <em> Native to Rabbit.</em>
            </h1>

            <p>
              Rabbit VRF exposes consensus-secured randomness directly to EVM applications
              without a centralized randomness API or trusted oracle operator.
              Anyone can request randomness on Rabbit Testnet. No mining or node
              setup is required. Submit a request, follow its status and inspect the on-chain result.
            </p>

            <div className="hero-ctas">
              <a className="button primary" href="#playground" onClick={() => setActiveTab('create')}>
                New request <ArrowRight size={15} />
              </a>
              <a className="button secondary" href="#developer-start" onClick={() => setActiveTab('developers')}>
                Developer integration
              </a>
            </div>

            <div className="platform-principles">
              <span><ShieldCheck size={15} /> Protocol active</span>
              <span><Network size={15} /> Chain ID 9280</span>
              <span><Wallet size={15} /> EVM wallet compatible</span>
            </div>
          </div>

          <div className="protocol-map vrf-hero-map">
            <div className="protocol-map-head">
              <div><ShieldCheck size={16} /><b>RABBIT VRF</b></div>
              <span>TESTNET LIVE</span>
            </div>

            <div className="protocol-map-body vrf-hero-body">
              <img
                className="vrf-hero-logo"
                src="/rabbit-vrf-logo.png"
                alt="Rabbit VRF"
              />

              <div className="vrf-hero-status">
                <span>VERIFIABLE RANDOM FUNCTION</span>
                <strong>Consensus-secured randomness for Rabbit Chain.</strong>
                <small>For games, NFT reveals, draws and EVM applications.</small>
              </div>
            </div>

            <div className="protocol-map-foot">
              <div><span>NETWORK</span><strong>Rabbit Testnet</strong></div>
              <div><span>CHAIN ID</span><strong>9280</strong></div>
              <div><span>BASE TARGET</span><strong>0.001 tRUSD</strong></div>
              <div><span>STATUS</span><strong>PUBLIC TESTNET</strong></div>
            </div>
          </div>
        </div>
      </section>

      <div className="shell vrf-workspace-tabs" role="tablist" aria-label="VRF workspace">
        {[['requests','My requests'],['create','New request'],['developers','Developers']].map(([key,label]) => <button key={key} id={`vrf-tab-${key}`} role="tab" aria-selected={activeTab === key} aria-controls={`vrf-panel-${key}`} onClick={() => setActiveTab(key)}>{label}</button>)}
      </div>
      <div id="vrf-panel-requests" role="tabpanel" aria-labelledby="vrf-tab-requests" hidden={activeTab !== 'requests'}>
      <section className="platform-v2-product vrf-dashboard" id="my-requests">
        <div className="shell">
          <div className="vrf-dashboard-head">
            <div><span className="section-kicker">YOUR WORKSPACE</span><h2>My requests</h2><p>Requests made by your connected wallet, read directly from Rabbit Testnet.</p></div>
            <div className="hero-ctas">
              <button className="button secondary" disabled={!connected || historyLoading} onClick={loadHistory}>{historyLoading ? 'Loading history…' : 'Refresh'}</button>
              <a className="button primary" href="#playground" onClick={() => setActiveTab('create')}>New request <ArrowRight size={15}/></a>
            </div>
          </div>
          {!connected ? <div className="product-panel vrf-wallet-empty"><Wallet size={28}/><h3>Your randomness workspace</h3><p>Connect your wallet to view previous requests, pending requests and verified results.</p><button className="button primary" onClick={onConnect}>Connect wallet</button></div> : <>
            <div className="vrf-dashboard-stats">
              <div><span>CONNECTED WALLET</span><strong>{shortHex(walletState.account)}</strong></div>
              <div><span>REQUESTS FOUND</span><strong>{history.length}</strong></div>
              <div><span>PENDING</span><strong>{history.filter(row => row.status === 1).length}</strong></div>
              <div><span>FULFILLED</span><strong>{history.filter(row => row.status === 2).length}</strong></div>
            </div>
            <div className="product-panel vrf-history-panel">
              <div className="vrf-history-toolbar"><div className="vrf-history-tabs">{['all','pending','fulfilled'].map(value => <button key={value} aria-pressed={historyFilter === value} onClick={() => setHistoryFilter(value)}>{value}</button>)}</div><small>{historyProgress || 'Preparing wallet history…'}</small></div>
              {historyError && <p className="vrf-error">History is incomplete: {historyError} Use Refresh to retry.</p>}
              {!historyLoading && !historyError && history.length === 0 && <div className="vrf-wallet-empty"><h3>No requests yet</h3><p>Create your first request to receive verifiable randomness.</p></div>}
              <div className="vrf-history-scroll"><table className="vrf-history-table"><thead><tr><th>Request ID</th><th>Status</th><th>Block</th><th>Protocol fee</th><th>Transaction</th><th>Result</th></tr></thead><tbody>
                {history.filter(row => historyFilter === 'all' || row.status === (historyFilter === 'pending' ? 1 : 2)).map(row => <tr key={row.id}>
                  <td><button className="vrf-history-id" title={row.id} onClick={() => {setRequestId(row.id); inspect(row.id); setActiveTab('create'); document.getElementById('playground')?.scrollIntoView({behavior:'smooth'})}}>{shortHex(row.id)}</button></td>
                  <td><span className={`vrf-status-pill ${row.status === 2 ? 'complete' : ''}`}>{row.status === null ? 'Checking' : statusName(row.status)}</span></td>
                  <td><a href={`${NETWORKS.testnet.explorerUrl}/block/${row.block}`} target="_blank" rel="noreferrer">{row.block.toLocaleString()}</a></td>
                  <td>{nativeAmount(row.fee)} tRAB</td>
                  <td><a href={`${NETWORKS.testnet.explorerUrl}/tx/${row.tx}`} target="_blank" rel="noreferrer">{shortHex(row.tx,6,4)} ↗</a></td>
                  <td><button className="button secondary" onClick={() => {setRequestId(row.id); inspect(row.id); setActiveTab('create'); document.getElementById('playground')?.scrollIntoView({behavior:'smooth'})}}>View {row.status === 2 ? 'result' : 'request'}</button></td>
                </tr>)}
              </tbody></table></div>
              {historyLoading && <p className="vrf-history-note">Searching the chain for this wallet. Results appear as they are found.</p>}
            </div>
          </>}
        </div>
      </section>

      </div>
      <div id="vrf-panel-create" role="tabpanel" aria-labelledby="vrf-tab-create" hidden={activeTab !== 'create'}>
      <section className="platform-v2-product" id="playground">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">NEW REQUEST</span>
            <h2>Request. Track. Verify.</h2>
          </div>
          <p>
            Request randomness directly from the Rabbit VRF coordinator.
            Connect your wallet to try it, or inspect any request without connecting.
            Fulfillment is asynchronous; a confirmed transaction is the first step.
          </p>
        </div>

        <div className="shell platform-product-grid">
          <div className="product-panel vrf-playground">
            <div className="product-panel-title">
              <div><ShieldCheck size={20} /><span>RABBIT VRF TESTNET</span></div>
              <b>PROTOCOL LIVE</b>
            </div>

            <div className="vrf-live-summary">
              <div>
                <span>PAYABLE FEE NOW</span>
                <strong>
                  {feeWei !== null ? `${nativeAmount(feeWei)} tRAB` : 'Unavailable'}
                </strong>
                <small>Canonical quote from quoteRequestFee(0)</small>
              </div>

              <div>
                <span>PRICING TARGET</span>
                <strong>0.001 tRUSD</strong>
                <small>Converted by the protocol to native tRAB</small>
              </div>
            </div>

            {feeError && <p className="vrf-error">{feeError}</p>}

            <div className="vrf-quick-start">
              <strong>Your first request</strong>
              <ol>
                <li>Connect an EVM wallet and switch to Rabbit Testnet.</li>
                <li>Get test tokens from the <Link to="/platform/faucet">Faucet</Link> for the request fee and gas.</li>
                <li>Request randomness and approve the transaction in your wallet.</li>
                <li>Keep this page open. Pending requests refresh automatically every 10 seconds.</li>
              </ol>
              <p>You do not need to mine. Test tokens have no real monetary value.</p>
            </div>
            <details className="vrf-advanced">
              <summary>Advanced: application context hash</summary>
              <p>Leave the default for a simple test. Developers can supply a bytes32 commitment to their application's inputs.</p>
            <div className="factory-form">
              <label>
                <span>APP DATA HASH · BYTES32</span>
                <input
                  value={appDataHash}
                  onChange={(event) => setAppDataHash(event.target.value)}
                  spellCheck="false"
                />
              </label>
            </div>
            </details>

            <button
              type="button"
              className="product-action"
              onClick={submitRequest}
              disabled={submitting || (connected && correctNetwork && !RABBIT_VRF.publicRequestsLive)}
            >
              {buttonLabel}
            </button>

            {transactionHash && (
              <p className="vrf-transaction" role="status">
                Transaction submitted: <a href={`${NETWORKS.testnet.explorerUrl}/tx/${transactionHash}`} target="_blank" rel="noreferrer">View in Explorer <ArrowUpRight size={12} /></a>
                <button className="copy-button" type="button" disabled={submitting} onClick={recoverRequest}>Recover request ID</button>
                <small>If confirmation takes longer, the transaction link remains available. Use “Recover request ID” below if the transaction was confirmed after the initial wait.</small>
              </p>
            )}
            <p className="product-disclaimer">
              Current Rabbit VRF V1 requires callbackGasLimit = 0. The exact quoted native fee
              must be supplied as msg.value. Callback execution is not enabled in the current public flow.
            </p>

            <div className="vrf-inspector">
              <div>
                <span>REQUEST INSPECTOR</span>
                <strong>Verify any Rabbit VRF request.</strong>
              </div>

              <div className="vrf-inspector-input">
                <input
                  value={requestId}
                  onChange={(event) => setRequestId(event.target.value)}
                  placeholder="0x… requestId"
                  aria-label="Rabbit VRF request ID"
                  spellCheck="false"
                />
                <button type="button" onClick={() => inspect()}>
                  <Search size={15} /> Inspect
                </button>
              </div>

              {inspectError && <p className="vrf-error">{inspectError}</p>}

              {request && (
                <div className="vrf-result-grid" aria-live="polite">
                  <div className="wide vrf-request-progress">
                    <strong>{Number(request.status) === 2 ? 'Randomness is ready' : Number(request.status) === 1 ? 'Waiting for consensus fulfillment' : 'Request not found'}</strong>
                    <p>{Number(request.status) === 2 ? 'The result is stored on-chain. Copy it or inspect the associated proof hash.' : Number(request.status) === 1 ? 'This request is still pending. Timing depends on network participation and committee readiness. Do not submit another request just because this one is taking longer.' : 'Check the request ID and make sure it belongs to Rabbit Testnet.'}</p>
                    {Number(request.status) === 1 && requestTimestamp && <small>Waiting since submission: {Math.max(0, Math.floor((clock-requestTimestamp)/60000))} min · refreshes every 10 seconds</small>}
                    <div className="vrf-result-actions">
                      <button type="button" onClick={() => copyValue(request.requestId)}>Copy request ID</button>
                      <button type="button" onClick={() => inspect(request.requestId)}>Refresh status</button>
                      {Number(request.status) !== 0 && <a href={`${NETWORKS.testnet.explorerUrl}/block/${String(request.requestBlock)}`} target="_blank" rel="noreferrer">Request block ↗</a>}
                    </div>
                  </div>
                  <div><span>STATUS</span><strong>{statusName(request.status)}</strong></div>
                  <div><span>REQUEST BLOCK</span><strong>{String(request.requestBlock)}</strong></div>
                  <div><span>EPOCH</span><strong>{String(request.epoch)}</strong></div>
                  <div><span>ROUND</span><strong>{String(request.round)}</strong></div>
                  <div><span>NONCE</span><strong>{String(request.requesterNonce)}</strong></div>
                  <div><span>FEE PAID</span><strong>{nativeAmount(request.feePaid)} tRAB</strong></div>

                  <div className="wide">
                    <span>REQUESTER</span>
                    <strong title={request.requester}>{shortHex(request.requester, 14, 10)}</strong>
                  </div>

                  <div className="wide">
                    <span>RANDOMNESS</span>
                    <code className="vrf-full-hash">{request.randomness}</code>
                    {Number(request.status) === 2 && <button className="copy-button vrf-copy" type="button" onClick={() => copyValue(request.randomness)}>Copy randomness</button>}
                  </div>

                  <div className="wide">
                    <span>PROOF HASH</span>
                    <code className="vrf-full-hash">{request.proofHash}</code>
                    {Number(request.status) === 2 && <button className="copy-button vrf-copy" type="button" onClick={() => copyValue(request.proofHash)}>Copy proof hash</button>}
                    <small>A proof hash identifies the proof; this page reads on-chain state and does not independently verify its cryptography.</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="product-context">
            <span>LIVE PROTOCOL</span>
            <h3>Rabbit VRF Coordinator V1</h3>
            <p>
              Consensus-installed EVM facade for canonical Rabbit VRF requests and fulfillment state.
            </p>

            <div>
              <ShieldCheck size={17} />
              <span>
                <b>Coordinator</b>
                <small>{shortHex(RABBIT_VRF.coordinator, 12, 10)}</small>
              </span>
            </div>

            <div>
              <Network size={17} />
              <span>
                <b>Activation</b>
                <small>DKG 136,065 · VRF 136,193</small>
              </span>
            </div>

            <div>
              <Wallet size={17} />
              <span>
                <b>Public requests</b>
                <small>{RABBIT_VRF.publicRequestsLive ? 'Open to users and contracts · no mining required' : 'Validation in progress'}</small>
              </span>
            </div>

            <a
              className="button secondary"
              href={`${NETWORKS.testnet.explorerUrl}/address/${RABBIT_VRF.coordinator}`}
              target="_blank"
              rel="noreferrer"
            >
              View coordinator <ArrowUpRight size={14} />
            </a>
          </aside>
        </div>
      </section>

      </div>
      <div id="vrf-panel-developers" role="tabpanel" aria-labelledby="vrf-tab-developers" hidden={activeTab !== 'developers'}>
      <section className="platform-v2-product vrf-developer-start" id="developer-start">
        <div className="shell platform-v2-product-head"><div><span className="section-kicker">DEVELOPER QUICKSTART</span><h2>Build a complete request flow.</h2></div><p>Direct payment per request. No subscription, mining setup or private node is required for an application to request randomness.</p></div>
        <div className="shell vrf-guide-grid">
          <article><span>01</span><h3>Submit and persist</h3><p>Read quoteRequestFee(0) immediately before sending. Pay exactly that amount in native tRAB, plus transaction gas. Save the transaction hash before waiting for confirmation.</p></article>
          <article><span>02</span><h3>Recover the request ID</h3><p>Decode RandomnessRequested from the coordinator receipt. A wallet transaction returns a transaction hash, not the Solidity return value. Save requestId together with your application round.</p></article>
          <article><span>03</span><h3>Read fulfillment</h3><p>Poll getRequest(requestId). Status 0 means not found, 1 means pending and 2 means fulfilled. A successful request transaction does not mean the random value is ready.</p></article>
          <article><span>04</span><h3>Settle exactly once</h3><p>Use the fulfilled value only for its original request and frozen application inputs. A contract should read the coordinator on-chain and reject duplicate settlement.</p></article>
        </div>
        <div className="shell vrf-explain-box"><div><span>CURRENT V1 INTEGRATION</span><h3>Read the result; do not wait for a callback.</h3><p>The supported request path uses callbackGasLimit = 0. Fulfillment updates coordinator state. Your application reads getRequest and handles settlement separately. proofHash identifies the protocol proof; it is not the complete proof payload.</p></div><div><span>NETWORK & COST</span><h3>Rabbit Testnet · 9280</h3><p>Use the coordinator address shown in the request panel and the public Rabbit Testnet RPC. The protocol quote is denominated in native tRAB. Gas is additional. The tRUSD pricing target is not an ERC-20 payment instruction.</p></div></div>
        <details className="shell vrf-developer-details"><summary>JavaScript quickstart · viem · submit, recover and read</summary><p>Install viem in your application. This browser example assumes an injected EVM wallet. For WalletConnect, pass your connected wallet's EIP-1193 provider to custom().</p><pre className="vrf-sdk-code" style={{padding:24, borderRadius:14, background:"#f3f1fa", color:"#40445a", overflowX:"auto", fontSize:12, lineHeight:1.8}}>{DEV_QUICKSTART}</pre><p>Call submitVrf from a user action, persist its hash, then call recoverRequest once the receipt is available. Persist that requestId and periodically call readVrf. Handle rejected signatures, reverted transactions and temporary RPC errors separately.</p></details>
        <div className="shell vrf-guide-grid">
          <article><h3>Commit your context</h3><p>For a real round, compute appDataHash from immutable inputs with abi.encode: application address, round ID and participants or rules. Store the same context in your application before seeing the result. Zero hash is suitable for a protocol test.</p></article>
          <article><h3>Recover after interruption</h3><p>Keep the transaction hash and request ID in durable application storage. A browser reload or timeout must resume the existing request. The wallet dashboard also discovers requests from indexed coordinator events.</p></article>
          <article><h3>Map randomness carefully</h3><p>Use domain-separated hashes to derive multiple draws from one result. Simple modulo has statistical bias unless the outcome count divides the sample space; use rejection sampling when exact uniformity matters.</p></article>
          <article><h3>Show honest states</h3><p>Separate awaiting signature, transaction pending, request pending and fulfilled. Fulfillment is asynchronous and depends on network availability. Do not promise a fixed response time or show a zero value as a completed result.</p></article>
        </div>
      </section>

      <details className="shell vrf-developer-details vrf-reference"><summary>Protocol reference, Solidity and application patterns</summary>
      <section className="platform-v2-stack">
        <div className="shell platform-v2-stack-grid">
          <div>
            <span className="section-kicker">HOW RABBIT VRF WORKS</span>
            <h2>One canonical request path.</h2>
            <p>
              Applications request randomness from the coordinator. Rabbit consensus
              processes the request and finalizes canonical randomness and proof state
              that applications can inspect on-chain.
            </p>
          </div>

          <div className="platform-v2-stack-rail">
            <div>
              <small>01</small>
              <span>APPLICATION</span>
              <strong>requestRandomness(0, appDataHash)</strong>
            </div>
            <i />
            <div>
              <small>02</small>
              <span>COORDINATOR</span>
              <strong>Canonical requestId · exact protocol fee</strong>
            </div>
            <i />
            <div className="accent">
              <small>03</small>
              <span>RABBIT CONSENSUS</span>
              <strong>DKG · threshold VRF · liveness rules</strong>
            </div>
            <i />
            <div>
              <small>04</small>
              <span>RESULT</span>
              <strong>Randomness · proofHash · epoch · round</strong>
            </div>
          </div>
        </div>
      </section>

      <details className="shell vrf-developer-details" id="integration">
        <summary>Developer integration · Solidity examples and application design</summary>
      <section className="rpc-section" id="integration-examples">
        <div className="shell rpc-grid">
          <div>
            <span className="section-kicker">DEVELOPER INTEGRATION</span>
            <h2>Simple EVM integration.</h2>
            <p>
              Query the current request fee, submit the exact native value and retain
              the requestId. Fulfillment state is available through getRequest().
            </p>
          </div>

          <pre>{`interface IRabbitVRFCoordinatorV1 {
    function quoteRequestFee(
        uint32 callbackGasLimit
    ) external view returns (uint256 fee);

    function requestRandomness(
        uint32 callbackGasLimit,
        bytes32 appDataHash
    ) external payable returns (bytes32 requestId);
}

// Current Rabbit VRF V1 public path:
uint256 fee = coordinator.quoteRequestFee(0);

bytes32 requestId =
    coordinator.requestRandomness{value: fee}(
        0,
        appDataHash
    );`}</pre>
        </div>
      </section>

      </details>

      <section className="platform-v2-product">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">BUILD WITH RANDOMNESS</span>
            <h2>Designed for EVM applications.</h2>
          </div>
          <p>
            Rabbit VRF provides a common verifiable randomness surface for applications
            that require unpredictable outcomes.
          </p>
        </div>

        <div className="shell tool-grid">
          <article><ShieldCheck size={21} /><h3>Games</h3><p>Game outcomes, item drops, maps, matchmaking seeds and randomized mechanics.</p></article>
          <article><Rocket size={21} /><h3>NFTs</h3><p>Traits, rarity, reveal ordering, mint selection and generative collections.</p></article>
          <article><Network size={21} /><h3>Draws</h3><p>Transparent randomized selections, raffles, rewards and participant draws.</p></article>
          <article><Code2 size={21} /><h3>Protocols</h3><p>General-purpose verifiable randomness for EVM smart contracts and applications.</p></article>
        </div>
      </section>

      <section className="platform-v2-product vrf-user-guide">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">HOW TO USE RABBIT VRF</span>
            <h2>From wallet to verifiable randomness.</h2>
          </div>

          <p>
            Rabbit VRF protocol rules are enabled on Testnet, Chain ID 9280.
            Public request testing is experimental; settle only after the request
            reports canonical completion.
            Rabbit Mainnet has not launched and Rabbit VRF must not be presented
            as a Mainnet service yet.
          </p>
        </div>

        <div className="shell vrf-guide-grid">
          <article>
            <span>01</span>
            <ShieldCheck size={22} />
            <h3>Understand the request</h3>
            <p>
              A Rabbit VRF request asks Rabbit consensus for an unpredictable
              random value. The request receives a unique requestId that can
              later be inspected on-chain.
            </p>
          </article>

          <article>
            <span>02</span>
            <Wallet size={22} />
            <h3>Use Rabbit Testnet</h3>
            <p>
              Connect an EVM wallet to Rabbit Testnet, Chain ID 9280. You need
              tRAB for the VRF protocol fee and the normal transaction gas cost.
              Mainnet is not live.
            </p>
          </article>

          <article>
            <span>03</span>
            <Code2 size={22} />
            <h3>Submit the request</h3>
            <p>
              The current V1 path uses callbackGasLimit = 0. First read
              quoteRequestFee(0), then send exactly that quoted native amount
              as msg.value to requestRandomness(0, appDataHash).
            </p>
          </article>

          <article>
            <span>04</span>
            <Search size={22} />
            <h3>Inspect the result</h3>
            <p>
              Save the requestId. getRequest(requestId) exposes the requester,
              request block, fee, epoch, round, randomness, proofHash and
              request status.
            </p>
          </article>
        </div>

        <div className="shell vrf-explain-box">
          <div>
            <span>FOR A NORMAL USER</span>
            <h3>What happens after you request randomness?</h3>
            <p>
              Your wallet submits one transaction to the Rabbit VRF Coordinator.
              The request is stored on-chain as pending. Rabbit consensus then
              processes the VRF request. When finalization is complete, the same
              requestId exposes the canonical randomness and proofHash.
            </p>
          </div>

          <div>
            <span>APP DATA HASH</span>
            <h3>What is appDataHash?</h3>
            <p>
              It is a developer-controlled bytes32 commitment that lets an
              application bind a VRF request to its own context, such as a game
              round, draw ID, player, mint, tournament or other application data.
              The playground can use the zero hash for a simple protocol test.
            </p>
          </div>

          <div>
            <span>FEES</span>
            <h3>Why does the fee show tRAB?</h3>
            <p>
              The protocol pricing target is 0.001 tRUSD per request, but the
              coordinator returns the current payable amount in native wei.
              Applications should always use quoteRequestFee(0) and never
              hard-code the payable tRAB amount.
            </p>
          </div>

          <div>
            <span>NO CALLBACK IN V1</span>
            <h3>How does an app receive the result?</h3>
            <p>
              Callback execution is not enabled in the current public V1 path.
              Applications read getRequest(requestId) after fulfillment. An
              on-chain application can expose a second settlement transaction
              that reads and consumes the fulfilled request.
            </p>
          </div>
        </div>
      </section>

      <section className="rpc-section vrf-developer-reference">
        <div className="shell rpc-grid">
          <div>
            <span className="section-kicker">EXACT V1 REQUEST FLOW</span>
            <h2>Do not guess the fee.</h2>

            <p>
              The coordinator requires an exact fee. callbackGasLimit must
              currently be zero. If the fee changes between quotation and
              submission, quote again before sending.
            </p>

            <div className="vrf-reference-list">
              <div><span>Network</span><strong>Rabbit Testnet</strong></div>
              <div><span>Chain ID</span><strong>9280 · 0x2440</strong></div>
              <div><span>Coordinator</span><strong>{RABBIT_VRF.coordinator}</strong></div>
              <div><span>Callback gas</span><strong>0 · required in V1</strong></div>
              <div><span>Pricing target</span><strong>0.001 tRUSD / request</strong></div>
              <div><span>Mainnet</span><strong>NOT LAUNCHED</strong></div>
            </div>
          </div>

          <pre>{`// 1. Read the exact payable fee
uint256 fee =
    coordinator.quoteRequestFee(0);

// 2. Bind the request to your application context
bytes32 appDataHash = keccak256(
    abi.encode(
        applicationId,
        roundId,
        user,
        applicationData
    )
);

// 3. Submit the canonical Rabbit VRF request
bytes32 requestId =
    coordinator.requestRandomness{value: fee}(
        0,
        appDataHash
    );

// 4. Store requestId in your application.
// 5. Later call getRequest(requestId).
// 6. Consume the result only after fulfillment.`}</pre>
        </div>
      </section>

      <details className="shell vrf-developer-details">
        <summary>Game integration · examples and fairness checklist</summary>
      <section className="platform-v2-product vrf-gaming-section" id="gaming">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">GAMING & CASINO INTEGRATION</span>
            <h2>Build games around a requestId, not a server RNG.</h2>
          </div>

          <p>
            On Rabbit Testnet, casino and game developers can bind each round to
            a Rabbit VRF request and settle only after canonical randomness is
            available. Production operators remain responsible for all legal,
            licensing and jurisdiction requirements applicable to their service.
          </p>
        </div>

        <div className="shell vrf-casino-flow">
          <article>
            <span>1</span>
            <h3>Lock the round</h3>
            <p>
              Record the player's wager, selected game parameters, round ID and
              every rule that can affect the result before asking for randomness.
              Do not let the operator change them after the VRF request.
            </p>
          </article>

          <article>
            <span>2</span>
            <h3>Commit the context</h3>
            <p>
              Hash the round context into appDataHash. This creates a permanent
              link between the randomness request and the game state that existed
              when the request was made.
            </p>
          </article>

          <article>
            <span>3</span>
            <h3>Request Rabbit VRF</h3>
            <p>
              The game contract reads quoteRequestFee(0) and calls
              requestRandomness(0, appDataHash) with the exact quoted fee.
              Store the returned requestId against that round.
            </p>
          </article>

          <article>
            <span>4</span>
            <h3>Wait for fulfillment</h3>
            <p>
              Do not choose a result while the request is pending. Read
              getRequest(requestId) and continue only when the canonical request
              has reached the completed state.
            </p>
          </article>

          <article>
            <span>5</span>
            <h3>Derive the game outcome</h3>
            <p>
              Convert the fulfilled bytes32 randomness into the outcome required
              by the game. When several random values are needed, derive separate
              values with domain separation instead of reusing one raw number.
            </p>
          </article>

          <article>
            <span>6</span>
            <h3>Settle once</h3>
            <p>
              Mark the round settled before transferring prizes or changing
              balances. A requestId must not be replayed, re-rolled or consumed
              by another round.
            </p>
          </article>
        </div>

        <div className="shell tool-grid vrf-game-types">
          <article>
            <ShieldCheck size={21} />
            <h3>Dice</h3>
            <p>
              Derive a bounded dice value from fulfilled randomness. Bind the
              player's selected number and round ID before the request.
            </p>
          </article>

          <article>
            <Network size={21} />
            <h3>Roulette</h3>
            <p>
              Freeze the bet set first, request one canonical random value, then
              derive the wheel result after fulfillment.
            </p>
          </article>

          <article>
            <Rocket size={21} />
            <h3>Slots</h3>
            <p>
              Derive independent reel values from the fulfilled randomness using
              different domain-separated hashes for each reel and position.
            </p>
          </article>

          <article>
            <Code2 size={21} />
            <h3>Cards & shuffles</h3>
            <p>
              Use deterministic shuffle logic driven by domain-separated values.
              For strict uniform distributions, use an unbiased mapping method
              instead of blindly applying modulo to every range.
            </p>
          </article>
        </div>
      </section>

      <section className="rpc-section vrf-casino-code">
        <div className="shell rpc-grid">
          <div>
            <span className="section-kicker">CASINO CONTRACT PATTERN</span>
            <h2>Request first. Settle later.</h2>

            <p>
              Because callbacks are disabled in Rabbit VRF V1, an on-chain game
              normally uses two transactions: one to create the VRF request and
              another to settle after fulfillment. The settlement function reads
              the coordinator itself; it does not trust a web server to provide
              the random result.
            </p>

            <p className="product-disclaimer">
              This is an integration pattern, not a complete production gambling
              contract. Production implementations still need accounting,
              payout limits, access controls, reentrancy protection, pause /
              recovery rules, audits and applicable legal controls.
            </p>
          </div>

          <pre>{`// Simplified Rabbit VRF game pattern

function openRound(
    uint256 roundId,
    bytes32 gameData
) external payable {
    uint256 fee =
        vrf.quoteRequestFee(0);

    bytes32 contextHash =
        keccak256(
            abi.encode(
                address(this),
                roundId,
                msg.sender,
                gameData
            )
        );

    bytes32 requestId =
        vrf.requestRandomness{value: fee}(
            0,
            contextHash
        );

    requestForRound[roundId] = requestId;
}

function settleRound(
    uint256 roundId
) external {
    bytes32 requestId =
        requestForRound[roundId];

    (
        address requester,
        ,
        ,
        uint64 epoch,
        uint64 round,
        ,
        ,
        ,
        bytes32 randomness,
        bytes32 proofHash,
        uint8 status
    ) = vrf.getRequest(requestId);

    require(
        requester == address(this),
        "foreign VRF request"
    );

    require(status == 2, "VRF pending");
    require(!settled[roundId], "already settled");

    settled[roundId] = true;

    // Derive the game-specific outcome from
    // randomness and store epoch / round /
    // proofHash for public auditability.
}`}</pre>
        </div>
      </section>

      <section className="platform-v2-product vrf-security-guide">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">FAIR GAME DESIGN</span>
            <h2>Randomness is only one part of fairness.</h2>
          </div>

          <p>
            A fair integration must also prevent the application itself from
            changing rules after requesting randomness or discarding an
            unfavorable fulfilled result.
          </p>
        </div>

        <div className="shell vrf-security-grid">
          <article>
            <strong>Commit before request</strong>
            <p>Freeze game inputs before the VRF transaction is submitted.</p>
          </article>

          <article>
            <strong>No re-rolls</strong>
            <p>Never request again just because a valid result is unfavorable.</p>
          </article>

          <article>
            <strong>One request, one round</strong>
            <p>Persist requestId and reject reuse across unrelated rounds.</p>
          </article>

          <article>
            <strong>Verify the requester</strong>
            <p>
              An on-chain application should confirm that getRequest() reports
              its own contract as requester before consuming the result.
            </p>
          </article>

          <article>
            <strong>Settle once</strong>
            <p>Use an irreversible settled/consumed flag before value transfer.</p>
          </article>

          <article>
            <strong>Domain-separate derived values</strong>
            <p>
              Use distinct hashes for reels, cards, players or other independent
              outcomes derived from one fulfilled randomness value.
            </p>
          </article>

          <article>
            <strong>Keep the audit trail</strong>
            <p>
              Store requestId and expose the associated randomness, epoch, round
              and proofHash so users can inspect the canonical on-chain state.
            </p>
          </article>

          <article>
            <strong>Do not claim more than V1 provides</strong>
            <p>
              The current web interface exposes canonical request and proofHash
              state. It does not claim that the browser independently performs
              cryptographic proof verification.
            </p>
          </article>
        </div>
      </section>

      </details>

      <section className="platform-v2-product vrf-faq">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">RABBIT VRF FAQ</span>
            <h2>What users and builders need to know.</h2>
          </div>
        </div>

        <div className="shell vrf-faq-grid">
          <article>
            <h3>Do I need to mine or run a node?</h3>
            <p>No. Anyone with an EVM wallet on Rabbit Testnet and enough tRAB for the quoted fee and transaction gas can request randomness. Developers can also request from a smart contract.</p>
          </article>
          <article>
            <h3>Why is my request still pending?</h3>
            <p>Submission and fulfillment are separate stages. Timing varies with network participation and committee readiness. This page checks pending requests every 10 seconds. Keep the request ID, inspect its status and wait for FULFILLED before using the result. A slow request does not need to be submitted again.</p>
          </article>
          <article>
            <h3>How is the VRF fee distributed?</h3>
            <p>At successful fulfillment, the protocol allocates 30% to the fulfillment block producer, 50% equally among the participants included in that request's validated VRF proof, and 20% plus integer rounding remainders to Rabbit Allocation. Transaction gas and mining block rewards are separate. Mining alone does not guarantee a share of a particular VRF fee.</p>
          </article>

          <article>
            <h3>What is active on Testnet?</h3>
            <p>
              Protocol rules activated on Testnet at block 136,193, after DKG
              preparation at 136,065. Availability V2 activated at block 173,057.
              V2.4.8 includes authenticated VRF relay through public peers without
              a new hard fork. Users and contracts do not need to mine to request randomness.
              Request submission and a successful transaction receipt do not prove
              fulfillment: inspect the request and wait for canonical completion.
            </p>
          </article>

          <article>
            <h3>Is Rabbit VRF live on Mainnet?</h3>
            <p>
              No. Rabbit Mainnet, Chain ID 928, has not launched. The current
              Rabbit VRF deployment and documentation are Testnet-only.
            </p>
          </article>

          <article>
            <h3>What do I pay?</h3>
            <p>
              The pricing target is 0.001 tRUSD per request. The coordinator
              converts that pricing model into the exact native tRAB value
              returned by quoteRequestFee(0). Normal transaction gas is separate.
            </p>
          </article>

          <article>
            <h3>Can I set callbackGasLimit?</h3>
            <p>
              Not in the current V1 public path. Any non-zero callbackGasLimit
              is rejected because callback funding and execution are not enabled.
            </p>
          </article>

          <article>
            <h3>How do I know my request is finished?</h3>
            <p>
              Keep the requestId and query getRequest(requestId). The inspector
              on this page exposes the same canonical stored request state.
            </p>
          </article>

          <article>
            <h3>Can a casino use Rabbit VRF?</h3>
            <p>
              Technically, an EVM game can bind a round to a Rabbit VRF request
              and settle from fulfilled on-chain randomness. Deployment of
              gambling services remains subject to the operator's applicable
              laws, licensing and jurisdictional requirements.
            </p>
          </article>
        </div>
      </section>

      <section className="platform-v2-actions">
        <div className="shell">
          <Link to="/developers">
            <Code2 size={21} />
            <span><small>BUILD</small><b>Developer resources</b><em>EVM, JSON-RPC and Rabbit network configuration.</em></span>
            <ArrowRight size={17} />
          </Link>

          <Link to="/platform">
            <Rocket size={21} />
            <span><small>PLATFORM</small><b>Rabbit Platform</b><em>Return to the complete Rabbit application workspace.</em></span>
            <ArrowRight size={17} />
          </Link>

          <a href={NETWORKS.testnet.explorerUrl} target="_blank" rel="noreferrer">
            <Search size={21} />
            <span><small>VERIFY</small><b>Rabbit Explorer</b><em>Inspect Testnet blocks, transactions and addresses.</em></span>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      </details>
      </div>
    </main>
  )
}
