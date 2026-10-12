import { useEffect, useState } from 'react'
import { createPublicClient, http, parseAbi, zeroAddress } from 'viem'
import {
  RABBIT_LAUNCHPOOL_V3_VRF as V3,
  RABBIT_LAUNCHPOOL_V3_ABI as V3_ABI
} from '../config/launchpool-v3'

const rpc = createPublicClient({
  transport: http(V3.rpc, { timeout: 25000 })
})

const registryAbi = V3_ABI.registry

const factoryAbi = parseAbi([
  'function roundOfLaunch(uint256) view returns (address)',
  'function allocationsOfLaunch(uint256) view returns (address)'
])

const roundAbi = parseAbi([
  'function registrationDeadline() view returns (uint256)',
  'function participantCount() view returns (uint256)',
  'function requested() view returns (bool)',
  'function cancelled() view returns (bool)'
])

export default function RabbitLaunchVRFDiscover({ onSelectToken }) {
  const [rounds, setRounds] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setBusy(true)
    setError('')

    try {
      const total = Number(await rpc.readContract({
        address: V3.registry,
        abi: registryAbi,
        functionName: 'launchCount'
      }))

      const found = []

      for (let id = 1; id <= total; id++) {
        const round = await rpc.readContract({
          address: V3.vrfFactory,
          abi: factoryAbi,
          functionName: 'roundOfLaunch',
          args: [BigInt(id)]
        })

        if (round === zeroAddress) continue

        const [launch, deadline, count, requested, cancelled] =
          await Promise.all([
            rpc.readContract({
              address: V3.registry,
              abi: registryAbi,
              functionName: 'launches',
              args: [BigInt(id)]
            }),
            rpc.readContract({
              address: round,
              abi: roundAbi,
              functionName: 'registrationDeadline'
            }),
            rpc.readContract({
              address: round,
              abi: roundAbi,
              functionName: 'participantCount'
            }),
            rpc.readContract({
              address: round,
              abi: roundAbi,
              functionName: 'requested'
            }),
            rpc.readContract({
              address: round,
              abi: roundAbi,
              functionName: 'cancelled'
            })
          ])

        const token = launch[1]
        const open =
          !requested &&
          !cancelled &&
          BigInt(Math.floor(Date.now() / 1000)) < deadline

        if (open) {
          found.push({ id, token, round, deadline, count })
        }
      }

      setRounds(found)
    } catch (e) {
      setError(e.shortMessage || e.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <section className="rlp-section">
      <div className="rlp-heading">
        <div>
          <h2>Rabbit VRF · Open Registrations</h2>
          <p>Discover verifiable fair launch rounds before trading begins.</p>
        </div>
      </div>

      <button type="button" disabled={busy} onClick={refresh}>
        {busy ? 'Loading rounds…' : '↻ Refresh VRF Rounds'}
      </button>

      {error && <p role="alert">{error}</p>}

      {!busy && !error && rounds.length === 0 &&
        <p>No open Rabbit VRF rounds currently found.</p>}

      <div className="rlp-clean-market-grid">
        {rounds.map(item => (
          <article className="rlp-clean-market-card" key={item.id}>
            <h3>VRF Launch #{item.id}</h3>
            <p>Token: {item.token}</p>
            <p>Participants: {item.count.toString()}</p>
            <p>
              Registration ends:
              {' '}{new Date(Number(item.deadline) * 1000).toLocaleString()}
            </p>
            <button type="button"
              onClick={() => onSelectToken(item.token)}>
              View / Join VRF Round
            </button>
            <a href={`${V3.explorer}/address/${item.round}`}
              target="_blank" rel="noreferrer">
              Verify on Explorer ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
