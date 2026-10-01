import { useEffect, useState } from 'react'
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
} from 'viem'
import { NETWORKS } from '../config/networks'
import { RABBIT_VRF } from '../config/vrf'
import PlatformNetworkSwitch from '../components/PlatformNetworkSwitch'

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
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  })

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

export default function Vrf({
  walletState,
  walletProvider,
  onConnect,
  onAddNetwork,
  toast,
}) {
  const [feeWei, setFeeWei] = useState(null)
  const [feeError, setFeeError] = useState('')
  const [appDataHash, setAppDataHash] = useState(ZERO_HASH)
  const [requestId, setRequestId] = useState('')
  const [request, setRequest] = useState(null)
  const [inspectError, setInspectError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      setInspectError('Enter a valid bytes32 Rabbit VRF request ID.')
      setRequest(null)
      return
    }

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
    } catch (error) {
      setInspectError(error?.message || 'Unable to read this request.')
      setRequest(null)
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

      toast?.('Rabbit VRF request submitted. Waiting for receipt.')

      const receipt = await waitForReceipt(hash)

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

      if (!emittedRequestId) {
        throw new Error('Transaction confirmed, but RandomnessRequested was not found.')
      }

      setRequestId(emittedRequestId)
      await inspect(emittedRequestId)
      toast?.('Rabbit VRF request confirmed.')
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
    <main>
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
            </p>

            <div className="hero-ctas">
              <a className="button primary" href="#playground">
                Test Rabbit VRF <ArrowRight size={15} />
              </a>
              <a className="button secondary" href="#integration">
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
                <small>Rabbit Core V2.4.2 · Protocol active since block 136,193</small>
              </div>
            </div>

            <div className="protocol-map-foot">
              <div><span>NETWORK</span><strong>Rabbit Testnet</strong></div>
              <div><span>CHAIN ID</span><strong>9280</strong></div>
              <div><span>BASE TARGET</span><strong>0.001 tRUSD</strong></div>
              <div><span>STATUS</span><strong>ACTIVE</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-v2-product" id="playground">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">VRF PLAYGROUND</span>
            <h2>Request. Track. Verify.</h2>
          </div>
          <p>
            The playground reads the live Rabbit VRF coordinator directly.
            Public request submission stays gated until the final browser flow is validated.
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

            <button
              type="button"
              className="product-action"
              onClick={submitRequest}
              disabled={submitting || (connected && correctNetwork && !RABBIT_VRF.publicRequestsLive)}
            >
              {buttonLabel}
            </button>

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
                  spellCheck="false"
                />
                <button type="button" onClick={() => inspect()}>
                  <Search size={15} /> Inspect
                </button>
              </div>

              {inspectError && <p className="vrf-error">{inspectError}</p>}

              {request && (
                <div className="vrf-result-grid">
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
                    <strong title={request.randomness}>{shortHex(request.randomness, 18, 12)}</strong>
                  </div>

                  <div className="wide">
                    <span>PROOF HASH</span>
                    <strong title={request.proofHash}>{shortHex(request.proofHash, 18, 12)}</strong>
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
                <small>{RABBIT_VRF.publicRequestsLive ? 'Enabled' : 'Final browser validation in progress'}</small>
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
              <small>04</small>
              <span>APPLICATION</span>
              <strong>requestRandomness(0, appDataHash)</strong>
            </div>
            <i />
            <div>
              <small>03</small>
              <span>COORDINATOR</span>
              <strong>Canonical requestId · exact protocol fee</strong>
            </div>
            <i />
            <div className="accent">
              <small>02</small>
              <span>RABBIT CONSENSUS</span>
              <strong>DKG · threshold VRF · liveness rules</strong>
            </div>
            <i />
            <div>
              <small>01</small>
              <span>RESULT</span>
              <strong>Randomness · proofHash · epoch · round</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="rpc-section" id="integration">
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
            Rabbit VRF is live on Rabbit Testnet, Chain ID 9280.
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

      <section className="platform-v2-product vrf-faq">
        <div className="shell platform-v2-product-head">
          <div>
            <span className="section-kicker">RABBIT VRF FAQ</span>
            <h2>What users and builders need to know.</h2>
          </div>
        </div>

        <div className="shell vrf-faq-grid">
          <article>
            <h3>Is Rabbit VRF live?</h3>
            <p>
              Yes on the public Rabbit Testnet. DKG preparation started at block
              136,065 and Rabbit VRF plus its liveness rules activated at block
              136,193.
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
    </main>
  )
}
