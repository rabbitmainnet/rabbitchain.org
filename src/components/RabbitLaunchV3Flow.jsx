import { useEffect, useState } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  parseAbi, parseUnits, isAddress, zeroAddress
} from 'viem'
import { RABBIT_LAUNCHPOOL_V3_VRF as V3 } from '../config/launchpool-v3'

const client = createPublicClient({
  transport: http(V3.rpc, { timeout: 25000 })
})

const registryAbi = parseAbi([
  'function launchIdOf(address) view returns (uint256)',
  'function launches(uint256) view returns (address,address,uint256,uint256,uint256,bool)'
])

const factoryAbi = parseAbi([
  'function roundOfLaunch(uint256) view returns (address)',
  'function allocationsOfLaunch(uint256) view returns (address)',
  'function createLaunchVRF(address,uint256,uint256) returns (address,address)'
])

const roundAbi = parseAbi([
  'function registrationDeadline() view returns (uint256)',
  'function participantCount() view returns (uint256)',
  'function registered(address) view returns (bool)',
  'function requested() view returns (bool)',
  'function settled() view returns (bool)',
  'function cancelled() view returns (bool)',
  'function bridge() view returns (address)',
  'function register()',
  'function requestRound() payable returns (bytes32)',
  'function settleRound()'
])

const allocationsAbi = parseAbi([
  'function funded() view returns (bool)',
  'function processed() view returns (bool)',
  'function refunded() view returns (bool)',
  'function maxWinners() view returns (uint256)',
  'function fund(uint256)',
  'function finalizeAllocations()',
  'function refundUnstarted()',
  'function refundStalled()'
])

const tokenAbi = parseAbi([
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)'
])

const bridgeAbi = parseAbi([
  'function quoteFee() view returns (uint256)'
])

const messageOf = e => e?.shortMessage || e?.message || String(e)

export default function RabbitLaunchV3Flow({
  token,
  walletState,
  walletProvider,
  onRegister
}) {
  const account = walletState?.account
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [hours, setHours] = useState('1')
  const [winners, setWinners] = useState('2')
  const [perWinner, setPerWinner] = useState('10')
  const [registrationBusy, setRegistrationBusy] = useState(false)

  const valid = isAddress(token || '')

  async function refresh() {
    if (!valid) {
      setState(null)
      return
    }

    try {
      const launchId = await client.readContract({
        address: V3.registry,
        abi: registryAbi,
        functionName: 'launchIdOf',
        args: [token]
      })

      if (launchId === 0n) {
        setState({ launchId, registered: false })
        return
      }

      const round = await client.readContract({
        address: V3.vrfFactory,
        abi: factoryAbi,
        functionName: 'roundOfLaunch',
        args: [launchId]
      })

      if (round === zeroAddress) {
        setState({ launchId, registered: true, round })
        return
      }

      const allocations = await client.readContract({
        address: V3.vrfFactory,
        abi: factoryAbi,
        functionName: 'allocationsOfLaunch',
        args: [launchId]
      })

      const [
        deadline, count, requested, settled, cancelled,
        funded, processed, refunded, maxWinners, joined
      ] = await Promise.all([
        client.readContract({
          address: round, abi: roundAbi,
          functionName: 'registrationDeadline'
        }),
        client.readContract({
          address: round, abi: roundAbi,
          functionName: 'participantCount'
        }),
        client.readContract({
          address: round, abi: roundAbi,
          functionName: 'requested'
        }),
        client.readContract({
          address: round, abi: roundAbi,
          functionName: 'settled'
        }),
        client.readContract({
          address: round, abi: roundAbi,
          functionName: 'cancelled'
        }),
        client.readContract({
          address: allocations, abi: allocationsAbi,
          functionName: 'funded'
        }),
        client.readContract({
          address: allocations, abi: allocationsAbi,
          functionName: 'processed'
        }),
        client.readContract({
          address: allocations, abi: allocationsAbi,
          functionName: 'refunded'
        }),
        client.readContract({
          address: allocations,
          abi: allocationsAbi,
          functionName: 'maxWinners'
        }),
        account
          ? client.readContract({
              address: round, abi: roundAbi,
              functionName: 'registered', args: [account]
            })
          : Promise.resolve(false)
      ])

      setState({
        launchId, registered: true, round, allocations,
        deadline, count, requested, settled, cancelled,
        funded, processed, refunded, maxWinners, joined
      })
      setError('')
    } catch (e) {
      setError(messageOf(e))
    }
  }

  useEffect(() => {
    refresh()
  }, [token, account])

  async function send(address, abi, functionName, args = [], value) {
    if (!account || !walletProvider?.request)
      throw Error('Connect MetaMask')

    const chain = await walletProvider.request({
      method: 'eth_chainId'
    })

    if (BigInt(chain) !== 9280n)
      throw Error('Switch to Rabbit Testnet 9280')

    const { request } = await client.simulateContract({
      account, address, abi, functionName, args,
      ...(value !== undefined ? { value } : {})
    })

    const wallet = createWalletClient({
      transport: custom(walletProvider)
    })

    const hash = await wallet.writeContract(request)

    const receipt = await client.waitForTransactionReceipt({
      hash, timeout: 180000
    })

    if (receipt.status !== 'success')
      throw Error('Transaction reverted: ' + hash)

    return receipt
  }

  async function execute(fn) {
    if (busy) return
    setBusy(true)
    setError('')

    try {
      await fn()
      await refresh()
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setBusy(false)
    }
  }

  const createRound = () => execute(async () => {
    const h = Number(hours)
    const n = Number(winners)

    if (!Number.isInteger(h) || h < 1 || h > 720)
      throw Error('Registration must be 1–720 hours')

    if (!Number.isInteger(n) || n < 1 || n > 32)
      throw Error('Choose 1–32 winners')

    const block = await client.getBlock()
    const deadline = block.timestamp + BigInt(h * 3600)

    await send(
      V3.vrfFactory,
      factoryAbi,
      'createLaunchVRF',
      [token, deadline, BigInt(n)]
    )
  })

  const join = () => execute(() =>
    send(state.round, roundAbi, 'register')
  )

  const fund = () => execute(async () => {
    if (!account) throw Error('Connect creator wallet')
    const decimals = await client.readContract({
      address: token, abi: tokenAbi, functionName: 'decimals'
    })
    const amount = parseUnits(
      perWinner.trim().replace(',', '.'), Number(decimals)
    )
    if (amount <= 0n) throw Error('Invalid allocation')
    const total = amount * state.maxWinners

    const balance = await client.readContract({
      address: token, abi: tokenAbi,
      functionName: 'balanceOf', args: [account]
    })
    if (balance < total) throw Error('Insufficient token balance')

    const allowance = await client.readContract({
      address: token, abi: tokenAbi,
      functionName: 'allowance',
      args: [account, state.allocations]
    })
    if (allowance < total) {
      await send(token, tokenAbi, 'approve',
        [state.allocations, total])
    }
    await send(state.allocations, allocationsAbi, 'fund', [amount])
  })

  const requestVRF = () => execute(async () => {
    const bridge = await client.readContract({
      address: state.round, abi: roundAbi, functionName: 'bridge'
    })
    const fee = await client.readContract({
      address: bridge, abi: bridgeAbi, functionName: 'quoteFee'
    })
    await send(state.round, roundAbi, 'requestRound', [], fee)
  })

  const settle = () => execute(() =>
    send(state.round, roundAbi, 'settleRound')
  )

  const finalize = () => execute(() =>
    send(state.allocations, allocationsAbi, 'finalizeAllocations')
  )

  const recover = () => execute(() =>
    send(state.allocations, allocationsAbi,
      state.requested ? 'refundStalled' : 'refundUnstarted')
  )

  if (!valid) return null

  const now = BigInt(Math.floor(Date.now() / 1000))
  const roundExists = state?.round &&
    state.round !== zeroAddress

  return (
    <section className="rlp-vrf-card">
      <div className="rlp-vrf-heading">
        <div>
          <span className="rlp-vrf-kicker">
            RABBIT VRF · REQUIRED
          </span>
          <h3>Mandatory Fair Launch</h3>
          <p>
            Every new launch requires a verifiable
            VRF round before market activation.
          </p>
        </div>
      </div>

      {!state && <p>Loading on-chain launch status…</p>}

      {state && !state.registered && (
        <div className="rlp-vrf-controls">
          <p>
            Step 1: Register this Rabbit Token Factory token
            in the Launchpool Registry.
          </p>
          <button
            type="button"
            disabled={!account || busy || registrationBusy}
            onClick={async () => {
              setRegistrationBusy(true)
              setError('')
              try {
                await onRegister()
                await refresh()
              } catch (e) {
                setError(messageOf(e))
              } finally {
                setRegistrationBusy(false)
              }
            }}
          >
            {registrationBusy ? 'Registering...' : 'Register Token for VRF'}
          </button>
        </div>
      )}

      {state?.registered && !roundExists && (
        <div className="rlp-vrf-controls">
          <p>VRF round not created yet.</p>

          <label>
            Registration period (hours)
            <input value={hours}
              onChange={e => setHours(e.target.value)}
              inputMode="numeric" />
          </label>

          <label>
            Number of winners
            <input value={winners}
              onChange={e => setWinners(e.target.value)}
              inputMode="numeric" />
          </label>

          <button type="button"
            disabled={busy || !account}
            onClick={createRound}>
            Create Mandatory VRF Round
          </button>
        </div>
      )}

      {roundExists && (
        <>
          <p>
            Registered participants:
            {' '}{state.count.toString()}
          </p>

          <p>
            Registration deadline:
            {' '}
            {new Date(
              Number(state.deadline) * 1000
            ).toLocaleString()}
          </p>

          <p>
            {state.cancelled ? 'Cancelled'
              : state.refunded ? 'Refunded'
              : state.processed ? 'Allocations finalized'
              : state.settled ? 'VRF settled'
              : state.requested ? 'VRF requested'
              : state.funded ? 'Registration open'
              : 'Awaiting prize funding'}
          </p>

          {state.funded &&
            !state.joined &&
            !state.requested &&
            !state.cancelled &&
            now < state.deadline && (
              <button type="button"
                disabled={busy || !account}
                onClick={join}>
                Join VRF Registration
              </button>
            )}


          {!state.funded && !state.requested &&
            !state.cancelled && now < state.deadline && (
              <div className="rlp-vrf-controls">
                <label>Tokens per winner
                  <input value={perWinner}
                    onChange={e => setPerWinner(e.target.value)}
                    inputMode="decimal" />
                </label>
                <button type="button" disabled={busy || !account}
                  onClick={fund}>Fund VRF Round</button>
              </div>
            )}

          {state.funded && !state.requested &&
            !state.cancelled && !state.refunded &&
            now >= state.deadline &&
            now < state.deadline + 604800n &&
            state.count >= 2n && (
              <button type="button" disabled={busy || !account}
                onClick={requestVRF}>Request Rabbit VRF</button>
            )}

          {state.requested && !state.settled &&
            !state.cancelled && !state.refunded && (
              <button type="button" disabled={busy || !account}
                onClick={settle}>Finalize VRF Result</button>
            )}

          {state.settled && !state.processed &&
            !state.cancelled && !state.refunded && (
              <button type="button" disabled={busy || !account}
                onClick={finalize}>Finalize Allocations</button>
            )}

          {state.processed && !state.refunded &&
            <p className="rlp-vrf-good">
              VRF completed. Market launch is now eligible.
            </p>}

          {state.funded && !state.processed && !state.refunded &&
            now >= state.deadline + 604800n && (
              <button type="button" disabled={busy || !account}
                onClick={recover}>Recover Eligible VRF Funds</button>
            )}

          {state.joined && <p>You are registered.</p>}

          <a
            href={`${V3.explorer}/address/${state.round}`}
            target="_blank" rel="noreferrer">
            Verify VRF round on Explorer ↗
          </a>
        </>
      )}

      <button type="button"
        disabled={busy} onClick={refresh}>
        Refresh VRF Status
      </button>

      {error && <p role="alert">{error}</p>}
    </section>
  )
}
