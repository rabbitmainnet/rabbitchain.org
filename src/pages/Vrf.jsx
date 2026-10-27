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

function VrfProofTelemetry({ requestId, readCoordinator }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!/^0x[0-9a-f]{64}$/i.test(requestId || '')) {
      setResult(null)
      return
    }

    let cancelled = false
    const configured = import.meta.env.VITE_RABBIT_VRF_TELEMETRY_URL
    const localPreview =
      ['127.0.0.1', 'localhost'].includes(window.location.hostname) &&
      window.location.port === '5188'
    const base = localPreview
      ? 'http://127.0.0.1:8768'
      : (configured || '')

    setResult(null)
    // Public static evidence is used when no telemetry API is configured.

    const check = async () => {
      try {
        const response = await fetch(
          `${base ? `${base.replace(/\/$/, '')}/api/vrf/telemetry/${requestId}` : `/vrf-telemetry/${requestId}.json`}`,
          { cache: 'no-store' }
        )
        if (!response.ok) return

        const data = await response.json()
        const evidence = data.evidence
        const milliseconds = data.measurement?.observedToProofMs
        const proofShort = data.measurement?.proofShort

        if (
          !Number.isFinite(milliseconds) ||
          milliseconds < 0 ||
          data.requestId?.toLowerCase() !== requestId.toLowerCase()
        ) return

        const chain = await readCoordinator('getRequest', [requestId])
        const chainProof = String(chain[9]).toLowerCase()
        const chainRandomness = String(chain[8]).toLowerCase()

        const onChainValid =
          Number(chain[10]) === 2 &&
          /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(chainProof) &&
          /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(chainRandomness)

        const logProofMatches =
          typeof proofShort === 'string' &&
          /^[0-9a-f]{6}\.\.[0-9a-f]{6}$/i.test(proofShort) &&
          chainProof.slice(2, 8) === proofShort.slice(0, 6).toLowerCase() &&
          chainProof.slice(-6) === proofShort.slice(-6).toLowerCase()

        const savedEvidenceMatches =
          evidence?.requestId?.toLowerCase() === requestId.toLowerCase() &&
          chainProof === String(evidence.proofHash).toLowerCase() &&
          chainRandomness === String(evidence.randomness).toLowerCase()

        const confirmed =
          onChainValid && logProofMatches &&
          (!evidence || savedEvidenceMatches)

        if (!cancelled && confirmed) {
          setResult({ milliseconds, evidence })
        }
      } catch {
        // Keep on-chain status independent of telemetry availability.
      }
    }

    check()
    const timer = setInterval(check, 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [requestId])

  if (!/^0x[0-9a-f]{64}$/i.test(requestId || '')) return null

  return (
    <div style={{
      padding: '14px 18px',
      margin: '14px 0',
      border: '1px solid #e1e3ed',
      borderRadius: 12,
      background: '#fff'
    }}>
      <div style={{ fontSize: 11, color: '#777b90', fontWeight: 700 }}>
        THRESHOLD PROOF GENERATION
      </div>
      {result ? (
        <>
          <strong style={{
            display: 'block', marginTop: 6, fontSize: 30,
            color: '#16845b', fontVariantNumeric: 'tabular-nums'
          }}>
            {(result.milliseconds / 1000).toFixed(3)} s
          </strong>
          <small>
            Node-observed first contribution to proof readiness.
            ProofHash and randomness matched on-chain.
          </small>
        </>
      ) : (
        <div style={{ marginTop: 7, color: '#777b90' }}>
          Measurement unavailable
        </div>
      )}
    </div>
  )
}
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
  const [activeTab, setActiveTab] = useState('create')
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
  const [vrfTiming, setVrfTiming] = useState(null)
  const [vrfRequestClocks, setVrfRequestClocks] = useState(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem('rabbit-vrf-request-clocks-v1') || '{}'
      )
      return value && typeof value === 'object' && !Array.isArray(value)
        ? value : {}
    } catch {
      return {}
    }
  })
  const [vrfDurations, setVrfDurations] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rabbit-vrf-durations-v1') || '{}')
      return saved && typeof saved === 'object' && !Array.isArray(saved)
        ? saved : {}
    } catch {
      return {}
    }
  })
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
        const pending = history.filter(row => row.status === 1)
        const updates = []

        // RPC reads are batched to avoid an unbounded burst.
        for (let offset = 0; offset < pending.length; offset += 8) {
          if (cancelled) return

          const batch = await Promise.allSettled(
            pending.slice(offset, offset + 8).map(async row => {
              const value = await readCoordinator('getRequest', [row.id])
              return {
                ...row,
                status: Number(value[10]),
                randomness: value[8],
                proofHash: value[9],
              }
            })
          )

          for (const result of batch) {
            if (result.status === 'fulfilled') {
              updates.push(result.value)
            }
          }
        }
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
    try {
      const saved = JSON.parse(
        localStorage.getItem('rabbit-vrf-active-timing') || 'null'
      )
      if (
        saved &&
        /^0x[0-9a-fA-F]{64}$/.test(saved.hash || '') &&
        Number.isFinite(saved.startedAt) &&
        saved.startedAt > 0 &&
        (saved.id === null ||
          /^0x[0-9a-fA-F]{64}$/.test(saved.id || ''))
      ) {
        setVrfTiming({
          hash: saved.hash,
          id: saved.id,
          startedAt: saved.startedAt,
          finishedAt: Number.isFinite(saved.finishedAt)
            ? saved.finishedAt
            : null,
        })
      }
    } catch { /* Browser storage is optional. */ }
  }, [])

  useEffect(() => {
    if (!vrfTiming) return
    try {
      localStorage.setItem(
        'rabbit-vrf-active-timing',
        JSON.stringify(vrfTiming)
      )
    } catch { /* Browser storage is optional. */ }
  }, [vrfTiming])

  useEffect(() => {
    if (!vrfTiming?.id || !vrfTiming.finishedAt ||
        vrfTiming.failed || !Number.isFinite(vrfTiming.startedAt)) return

    const id = vrfTiming.id.toLowerCase()
    const seconds = Math.max(
      0, (vrfTiming.finishedAt - vrfTiming.startedAt) / 1000
    )

    setVrfDurations(previous => {
      if (previous[id] !== undefined) return previous
      const next = { ...previous, [id]: seconds }
      try {
        localStorage.setItem('rabbit-vrf-durations-v1', JSON.stringify(next))
      } catch { /* Optional storage */ }
      return next
    })
  }, [vrfTiming])

  // One independent clock for every pending wallet-history request.
  // The start is the canonical request-block timestamp, not a guessed send time.
  useEffect(() => {
    let cancelled = false

    const missing = history.filter(row =>
      row.status === 1 &&
      !vrfRequestClocks[row.id.toLowerCase()]
    )

    async function loadRequestClocks() {
      for (let offset = 0; offset < missing.length; offset += 4) {
        if (cancelled) return

        const batch = await Promise.all(
          missing.slice(offset, offset + 4).map(async row => {
            try {
              const block = await rpc(
                'eth_getBlockByNumber',
                [`0x${row.block.toString(16)}`, false]
              )
              if (!block?.timestamp) return null

              return {
                id: row.id.toLowerCase(),
                startedAt: Number(BigInt(block.timestamp)) * 1000,
                account: walletState.account.toLowerCase(),
              }
            } catch {
              return null
            }
          })
        )

        if (cancelled) return

        setVrfRequestClocks(previous => {
          const next = { ...previous }
          let changed = false

          for (const item of batch) {
            if (!item || next[item.id]) continue
            next[item.id] = {
              startedAt: item.startedAt,
              finishedAt: null,
              account: item.account,
            }
            changed = true
          }

          return changed ? next : previous
        })
      }
    }

    if (missing.length) loadRequestClocks()
    return () => { cancelled = true }
  }, [history, walletState?.account])

  // Freeze each request separately when the history observes FULFILLED.
  useEffect(() => {
    const completed = history.filter(row => {
      const entry = vrfRequestClocks[row.id.toLowerCase()]
      return row.status === 2 &&
        entry &&
        entry.finishedAt === null &&
        entry.account === walletState?.account?.toLowerCase()
    })

    if (!completed.length) return

    const detectedAt = Date.now()

    setVrfRequestClocks(previous => {
      const next = { ...previous }
      let changed = false

      for (const row of completed) {
        const key = row.id.toLowerCase()
        const entry = next[key]
        if (!entry || entry.finishedAt !== null) continue

        next[key] = { ...entry, finishedAt: detectedAt }
        changed = true
      }

      return changed ? next : previous
    })
  }, [history, vrfRequestClocks, walletState?.account])

  useEffect(() => {
    try {
      localStorage.setItem(
        'rabbit-vrf-request-clocks-v1',
        JSON.stringify(vrfRequestClocks)
      )
    } catch { /* Storage is optional. */ }
  }, [vrfRequestClocks])

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 100)
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

  // Independent tracking of the submitted VRF transaction.
  // Never depends on the manually selected inspector request.
  useEffect(() => {
    if (!vrfTiming?.hash || vrfTiming.finishedAt !== null) {
      return undefined
    }

    let cancelled = false
    let timer
    const hash = vrfTiming.hash

    async function check() {
      if (cancelled) return

      try {
        let id = vrfTiming.id

        if (!id || !Number.isFinite(vrfTiming.startedAt)) {
          const receipt = await rpc('eth_getTransactionReceipt', [hash])
          if (cancelled) return

          if (receipt) {
            if (chainNumber(receipt.status) !== 1) {
              setVrfTiming(previous =>
                previous?.hash === hash && previous.finishedAt === null
                  ? { ...previous, failed: true, finishedAt: Date.now() }
                  : previous
              )
              return
            }

            const includedBlock = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false])
            const includedAt = chainNumber(includedBlock?.timestamp) * 1000
            if (!Number.isFinite(includedAt) || includedAt <= 0) {
              throw new Error('Request block timestamp unavailable')
            }
            id = id || requestIdFromReceipt(receipt)
            setVrfTiming(previous =>
              previous?.hash === hash
                ? {
                    ...previous,
                    id: previous.id || id,
                    startedAt: Number.isFinite(previous.startedAt)
                      ? previous.startedAt : includedAt,
                  }
                : previous
            )
            if (id) setRequestId(id)
          }
        }

        if (id) {
          const result = await readCoordinator('getRequest', [id])
          if (cancelled) return

          if (
            Number(result[10]) === 2 &&
            /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(String(result[8])) &&
            /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(String(result[9]))
          ) {
            setVrfTiming(previous =>
              previous?.hash === hash &&
              (!previous.id || previous.id.toLowerCase() === id.toLowerCase()) &&
              previous.finishedAt === null &&
               Number.isFinite(previous.startedAt)
                ? { ...previous, id, finishedAt: Date.now() }
                : previous
            )
            return
          }
        }
      } catch {
        // Temporary RPC errors do not invalidate the transaction.
      } finally {
        if (!cancelled) timer = setTimeout(check, 1000)
      }
    }

    timer = setTimeout(check, 1000)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [vrfTiming?.hash, vrfTiming?.id, vrfTiming?.startedAt, vrfTiming?.finishedAt])

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

      if (
        Number(status) === 2 &&
        /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(String(randomness)) &&
        /^0x(?!0{64}$)[0-9a-f]{64}$/i.test(String(proofHash))
      ) {
        setVrfTiming(previous => {
          if (
            !previous ||
            previous.finishedAt !== null ||
            !Number.isFinite(previous.startedAt)
          ) return previous

          const sameId =
            previous.id?.toLowerCase() === clean.toLowerCase()

          // Never finish a timer for an unrelated inspected request.
          if (!sameId) return previous

          return {
            ...previous,
            id: clean,
            finishedAt: Date.now(),
          }
        })
      }

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
            const startedAt = Number(BigInt(block.timestamp)) * 1000
            setRequestTimestamp(startedAt)

            if (Number(status) === 1) {
              const key = clean.toLowerCase()
              setVrfRequestClocks(previous => {
                if (previous[key]) return previous

                return {
                  ...previous,
                  [key]: {
                    startedAt,
                    finishedAt: null,
                    account: requester.toLowerCase(),
                  },
                }
              })
            }
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
      setVrfTiming(previous =>
        previous?.hash?.toLowerCase() === transactionHash.toLowerCase()
          ? { ...previous, id }
          : previous
      )
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
      setVrfTiming({
        hash,
        id: null,
        startedAt: null,
        finishedAt: null,
      })
      try { localStorage.setItem('rabbit-vrf-last-transaction', hash) } catch { /* Optional. */ }
      toast?.('Rabbit VRF request submitted. Waiting for receipt.')

      const receipt = await waitForReceipt(hash)
      if (chainNumber(receipt.status) !== 1) throw new Error('Transaction reverted. No VRF request was created.')

      const emittedRequestId = requestIdFromReceipt(receipt)

      if (!emittedRequestId) {
        throw new Error('Transaction confirmed, but RandomnessRequested was not found.')
      }

      const includedBlock = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false])
      const includedAt = chainNumber(includedBlock?.timestamp) * 1000
      setRequestId(emittedRequestId)
      setVrfTiming(previous =>
        previous?.hash === hash
          ? {
              ...previous,
              id: emittedRequestId,
              startedAt: Number.isFinite(includedAt) && includedAt > 0
                ? includedAt : previous.startedAt,
            }
          : previous
      )
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
            <img className="vrf-workspace-logo" src="/rabbit-vrf-logo.png" alt="Rabbit VRF" />
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
              <div><span>BASE TARGET</span><strong>0.005 tRUSD from block 320,000</strong></div>
              <div><span>STATUS</span><strong>PUBLIC TESTNET</strong></div>
            </div>
          </div>
        </div>
      </section>

      <div className="shell vrf-workspace-tabs" role="tablist" aria-label="VRF workspace">
        {[['create','New request'],['requests','My requests'],['developers','Developers']].map(([key,label]) => <button key={key} id={`vrf-tab-${key}`} role="tab" aria-selected={activeTab === key} aria-controls={`vrf-panel-${key}`} onClick={() => setActiveTab(key)}>{label}</button>)}
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
              <div className="vrf-history-scroll"><table className="vrf-history-table"><thead><tr><th>Request ID</th><th>Status</th><th>Block</th><th>Protocol fee</th><th>Response time</th><th>Transaction</th><th>Result</th></tr></thead><tbody>
                {history.filter(row => historyFilter === 'all' || row.status === (historyFilter === 'pending' ? 1 : 2)).map(row => <tr key={row.id}>
                  <td><button className="vrf-history-id" title={row.id} onClick={() => {setRequestId(row.id); inspect(row.id); setActiveTab('create'); document.getElementById('playground')?.scrollIntoView({behavior:'smooth'})}}>{shortHex(row.id)}</button></td>
                  <td><span className={`vrf-status-pill ${row.status === 2 ? 'complete' : ''}`}>{row.status === null ? 'Checking' : statusName(row.status)}</span></td>
                  <td><a href={`${NETWORKS.testnet.explorerUrl}/block/${row.block}`} target="_blank" rel="noreferrer">{row.block.toLocaleString()}</a></td>
                  <td>{nativeAmount(row.fee)} tRAB</td>
                  <td style={{whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                    {(() => {
                      const key = row.id.toLowerCase()
                      const observed = vrfDurations[key]
                      const tracked = vrfRequestClocks[key]
                      const sameWallet =
                        tracked?.account === walletState?.account?.toLowerCase()

                      if (
                        Number.isFinite(observed) &&
                        row.status === 2 &&
                        row.tx?.toLowerCase() ===
                          vrfTiming?.hash?.toLowerCase() &&
                        vrfTiming?.id?.toLowerCase() === key
                      ) {
                        return `${observed.toFixed(1)}s`
                      }

                      if (!sameWallet || !Number.isFinite(tracked?.startedAt)) {
                        return row.status === 1 ? 'Loading…' : '—'
                      }

                      const endpoint = tracked.finishedAt ?? clock
                      const elapsed = Math.max(
                        0,
                        Math.floor((endpoint - tracked.startedAt) / 1000)
                      )
                      const minutes = Math.floor(elapsed / 60)
                      const seconds = String(elapsed % 60).padStart(2, '0')

                      return (
                        <span title="Approximate: request-block timestamp to browser detection">
                          {minutes}:{seconds}
                          {row.status === 1 ? ' · live' : ' · approx.'}
                        </span>
                      )
                    })()}
                  </td>
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
                <strong>0.005 tRUSD from block 320,000</strong>
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

            <VrfProofTelemetry readCoordinator={readCoordinator} requestId={vrfTiming?.id} />
            {vrfTiming && (() => {
              const elapsed = Number.isFinite(vrfTiming.startedAt)
                ? Math.max(0, (vrfTiming.finishedAt ?? clock) - vrfTiming.startedAt)
                : 0
              const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0')
              const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')
              const tenths = Math.floor((elapsed % 1000) / 100)
              const failed = Boolean(vrfTiming.failed)
              const done = vrfTiming.finishedAt !== null && !failed
              const label = failed
                ? 'Transaction failed'
                : done
                  ? 'Fulfilled'
                  : !Number.isFinite(vrfTiming.startedAt)
                    ? 'Confirming'
                    : 'Pending'

              return (
                <div style={{
                  margin: '14px 0',
                  padding: '15px 18px',
                  background: '#fff',
                  border: '1px solid #e1e3ed',
                  borderRadius: 12,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <strong style={{
                      color: '#171729',
                      fontSize: 13,
                    }}>
                      Rabbit VRF · Request status
                    </strong>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: 7,
                      background: failed
                        ? '#fff1f1'
                        : done
                          ? '#edf8f2'
                          : '#f3f0fc',
                      color: failed
                        ? '#b42318'
                        : done
                          ? '#16845b'
                          : '#6846bd',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {label}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 14,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 10,
                        letterSpacing: '0.06em',
                        color: '#777b90',
                        marginBottom: 4,
                      }}>
                        {done ? 'OBSERVED RESPONSE TIME' : 'ELAPSED TIME'}
                      </div>
                      <div style={{
                        color: '#171729',
                        fontSize: 31,
                        fontWeight: 750,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.15,
                      }}>
                        {minutes}:{seconds}
                        <span style={{
                          fontSize: 17,
                          color: '#777b90',
                        }}>.{tenths}</span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: 12,
                      color: '#70758a',
                    }}>
                      {failed
                        ? 'Transaction reverted'
                        : done
                          ? 'Randomness ready'
                          : vrfTiming.id
                            ? 'Waiting for VRF'
                            : 'Waiting for confirmation'}
                    </span>
                  </div>

                  <div style={{
                    marginTop: 11,
                    color: '#9699a8',
                    fontSize: 10,
                    lineHeight: 1.5,
                  }}>
                    Browser-observed timing · Approximate, includes RPC detection delay
                  </div>
                </div>
              )
            })()}

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
                    {Number(request.status) === 1 && requestTimestamp && (
                      <small>
                        Waiting since request block: {
                          Math.max(0, Math.floor(
                            (clock - requestTimestamp) / 1000
                          ))
                        } seconds · status refreshes every 10 seconds
                      </small>
                    )}
                    {Number(request.status) === 2 &&
                      vrfTiming?.id?.toLowerCase() !==
                        request.requestId.toLowerCase() && (
                        <small>
                          Fulfilled on-chain · historical duration not recorded
                        </small>
                      )}
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
                    <VrfProofTelemetry readCoordinator={readCoordinator} requestId={requestId} />
                    <code className="vrf-full-hash">{request.proofHash}</code>
                    {Number(request.status) === 2 && <button className="copy-button vrf-copy" type="button" onClick={() => copyValue(request.proofHash)}>Copy proof hash</button>}
                    <small>A proof hash identifies the proof; this page reads on-chain state and does not independently verify its cryptography.</small>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      </section>

      </div>
      <div id="vrf-panel-developers" role="tabpanel" aria-labelledby="vrf-tab-developers" hidden={activeTab !== 'developers'}>
      <section className="platform-v2-product vrf-developer-start" id="developer-start">
        <div className="shell platform-v2-product-head"><div><span className="section-kicker">DEVELOPER QUICKSTART</span><h2>Add randomness to your app.</h2></div><p>Three steps: send a request, save its ID and read the result. Use the public RPC and an EVM wallet. No subscription or mining setup is needed.</p></div>
        <div className="shell vrf-guide-grid vrf-simple-steps">
          <article><span>01 · REQUEST</span><h3>Send your request</h3><p>Read quoteRequestFee(0), then call requestRandomness(0, appDataHash) with that exact fee in tRAB. Gas is additional.</p><code>quote → request → transaction hash</code></article>
          <article><span>02 · SAVE</span><h3>Keep the request ID</h3><p>After confirmation, read RandomnessRequested from the transaction receipt. Save requestId with your application's round.</p><code>receipt → event → requestId</code></article>
          <article><span>03 · READ</span><h3>Use the completed result</h3><p>Call getRequest(requestId). Wait for status 2, then use randomness. Status 1 means pending; retry the read without sending another request.</p><code>getRequest → status 2 → randomness</code></article>
        </div>
        <div className="shell vrf-explain-box"><div><span>CURRENT V1 INTEGRATION</span><h3>Read the result; do not wait for a callback.</h3><p>The supported request path uses callbackGasLimit = 0. Fulfillment updates coordinator state. Your application reads getRequest and handles settlement separately. proofHash identifies the protocol proof; it is not the complete proof payload.</p></div><div><span>NETWORK & COST</span><h3>Rabbit Testnet · 9280</h3><p>Use the coordinator address shown in the request panel and the public Rabbit Testnet RPC. The protocol quote is denominated in native tRAB. Gas is additional. The tRUSD pricing target is not an ERC-20 payment instruction.</p></div></div>
                <section className="shell vrf-developer-details" id="vrf-performance-guide" style={{
          marginTop: 24, marginBottom: 24, padding: 24,
          border: '1px solid #e1e3ed', borderRadius: 14,
          background: '#fff'
        }}>
          <span className="section-kicker">PUBLIC TESTNET  DEVELOPER VERIFICATION</span>
          <h2>VRF performance: measure every stage.</h2>
          <p>
            Rabbit VRF produces threshold proofs separately from the block
            that records canonical fulfillment. Fast proof generation does not
            imply equally fast on-chain confirmation. These are distinct
            metrics and must not be presented as the same latency.
          </p>

          <div className="vrf-guide-grid">
            <article>
              <h3>01  Threshold proof generation</h3>
              <p>
                Node-observed time from the first logged inbound contribution
                to local proof readiness. This excludes any waiting before
                that first contribution, transaction inclusion and on-chain
                finalization. It is not a full request latency or a service
                level guarantee.
              </p>
            </article>
            <article>
              <h3>02  On-chain response</h3>
              <p>
                Approximate browser-observed delay until the coordinator
                returns status 2 and nonzero randomness and proofHash.
                Block production, RPC polling and clock differences influence
                the measurement. Rabbit Testnet targets approximately
                ten-second blocks; actual intervals vary.
              </p>
            </article>
            <article>
              <h3>03  Match the evidence</h3>
              <p>
                Inspect the request ID, on-chain randomness and proofHash.
                When available, node telemetry can be associated with this
                canonical result. A matching hash does not independently
                authenticate the node clock or verify the underlying
                threshold cryptographic proof.
              </p>
            </article>
          </div>

          <h3>Integrate safely with Rabbit Testnet</h3>
          <ol>
            <li>
              Query quoteRequestFee(0) for the current native tRAB fee.
              Transaction gas is additional. The tRUSD figure is a
              pricing reference, not an ERC-20 payment.
            </li>
            <li>
              Call requestRandomness(0, appDataHash) with the quoted
              msg.value. Keep the transaction hash and recover requestId
              from the RandomnessRequested event.
            </li>
            <li>
              Poll getRequest(requestId). Status 1 means pending.
              Consume randomness only when status equals 2 and the
              canonical proofHash and randomness are nonzero.
            </li>
            <li>
              Inspect optional performance telemetry separately.
              Missing telemetry does not invalidate a fulfilled
              on-chain result. Do not request again solely because
              a measurement is missing or the RPC is temporarily slow.
            </li>
          </ol>

          <p>
            <strong>Trust boundary:</strong> The public coordinator
            provides canonical fulfillment state. Node timing is an
            operational observation, not a consensus-certified timestamp.
            The exposed proofHash is a commitment or identifier, not the
            complete threshold proof payload. Independent cryptographic
            verification requires the protocol proof and its verifier.
          </p>
          <p>
            <strong>Cost and transparency:</strong> Testnet fees are
            charged in tRAB according to the live coordinator quote.
            Gas is additional. Compare VRF services only with equivalent
            network conditions, finality definitions and cost components.
            Do not treat individual fast observations as guaranteed latency.
          </p>
          <p>
            <strong>Availability:</strong> Measurements are shown only
            where a matching telemetry record is available. Until the
            telemetry API is deployed and independently monitored, local
            development measurements are not a public monitoring service.
          </p>
        </section>
<details className="shell vrf-developer-details"><summary>JavaScript example · send a request and read the result</summary><p>Install viem in your application. This browser example assumes an injected EVM wallet. For WalletConnect, pass your connected wallet's EIP-1193 provider to custom().</p><pre className="vrf-sdk-code" style={{padding:24, borderRadius:14, background:"#f3f1fa", color:"#40445a", overflowX:"auto", fontSize:12, lineHeight:1.8}}>{DEV_QUICKSTART}</pre><p>Call submitVrf from a user action, persist its hash, then call recoverRequest once the receipt is available. Persist that requestId and periodically call readVrf. Handle rejected signatures, reverted transactions and temporary RPC errors separately.</p></details>
        <details className="shell vrf-developer-details"><summary>Production checklist · recovery, security and fair draws</summary>
        <div className="shell vrf-guide-grid">
          <article><h3>Commit your context</h3><p>For a real round, compute appDataHash from immutable inputs with abi.encode: application address, round ID and participants or rules. Store the same context in your application before seeing the result. Zero hash is suitable for a protocol test.</p></article>
          <article><h3>Recover after interruption</h3><p>Keep the transaction hash and request ID in durable application storage. A browser reload or timeout must resume the existing request. The wallet dashboard also discovers requests from indexed coordinator events.</p></article>
          <article><h3>Map randomness carefully</h3><p>Use domain-separated hashes to derive multiple draws from one result. Simple modulo has statistical bias unless the outcome count divides the sample space; use rejection sampling when exact uniformity matters.</p></article>
          <article><h3>Show honest states</h3><p>Separate awaiting signature, transaction pending, request pending and fulfilled. Fulfillment is asynchronous and depends on network availability. Do not promise a fixed response time or show a zero value as a completed result.</p></article>
        </div>
        </details>
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
              The protocol pricing target is 0.005 tRUSD from block 320,000 per request, but the
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
              <div><span>Pricing target</span><strong>0.005 tRUSD from block 320,000 / request</strong></div>
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
            <p>Submission, early proof delivery and canonical fulfillment are separate stages. Two local SSD-backed tests verified all 48 early proofs in 0.176–1.242 seconds after observed inclusion, including requests across an epoch transition. This is not a public-network SLA; transaction inclusion adds waiting time. Blocks retain a 10-second target. Timing varies with network participation and committee readiness. This page checks pending requests every 10 seconds. Keep the request ID, inspect its status and wait for FULFILLED before using the result. A slow request does not need to be submitted again.</p>
          </article>
          <article>
            <h3>How is the VRF fee distributed?</h3>
            <p>Before block 320,000, VRF fees use the historical 30% producer / 50% validated signers / 20% allocation split. From block 320,000, successful fulfillment allocates 20% to the fulfillment block producer, 30% equally among the validated VRF signers, and 50% plus integer rounding remainders to the existing development allocation address. Pending requests retain their recorded fee; the split follows the fulfillment block. Transaction gas and 70/30 mining rewards are separate.</p>
          </article>

          <article>
            <h3>What is active on Testnet?</h3>
            <p>
              Protocol rules activated on Testnet at block 136,193, after DKG
              preparation at 136,065. Availability V2 activated at block 173,057.
              V2.4.16 includes authenticated VRF relay through public peers with existing VRF rules preserved.
              WorkSeat liveness V2 activates at Testnet block 323,800. Users and contracts do not need to mine to request randomness.
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
              The pricing target is 0.005 tRUSD from block 320,000 per request. The coordinator
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
