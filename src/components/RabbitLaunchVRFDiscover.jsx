import { useCallback, useEffect, useRef, useState } from 'react'
import { createPublicClient, http, parseAbi, zeroAddress } from 'viem'
import { ShieldCheck, RefreshCw, Users, Clock3, ArrowUpRight } from 'lucide-react'
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

const ui = {
  section: {
    border: '1px solid #e8e1f5',
    borderRadius: 18,
    padding: '18px 20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)'
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12
  },
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 13,
    color: '#7436d6',
    background: '#eee6ff'
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 750,
    color: '#20183d'
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#746a87',
    fontSize: 12,
    lineHeight: 1.5
  },
  refresh: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: '1px solid #e4ddef',
    background: '#fff',
    color: '#56456e',
    borderRadius: 10,
    padding: '8px 11px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer'
  },
  empty: {
    marginTop: 14,
    borderTop: '1px solid #eeeaf5',
    paddingTop: 14,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: '#756d84',
    fontSize: 13
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: 12,
    marginTop: 16
  },
  card: {
    border: '1px solid #e5dafa',
    borderRadius: 14,
    background: '#fff',
    padding: 16,
    minWidth: 0
  },
  tag: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4d238e',
    background: '#f0e8ff',
    padding: '5px 9px',
    borderRadius: 20
  },
  action: {
    border: 0,
    borderRadius: 10,
    background: 'linear-gradient(90deg, #762df0, #a760f3)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '11px 14px',
    cursor: 'pointer',
    width: '100%',
    marginTop: 14
  }
}

export default function RabbitLaunchVRFDiscover({ onSelectToken }) {
  const [rounds, setRounds] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const mounted = useRef(false)

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true

    if (mounted.current) {
      setBusy(true)
      setError('')
    }

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

        const open = !requested && !cancelled &&
          BigInt(Math.floor(Date.now() / 1000)) < deadline

        if (open) {
          found.push({
            id,
            token: launch[1],
            round,
            deadline,
            count
          })
        }
      }

      if (mounted.current) setRounds(found)
    } catch (e) {
      if (mounted.current) {
        setError(e.shortMessage || e.message)
      }
    } finally {
      inFlight.current = false
      if (mounted.current) setBusy(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    refresh()
    const interval = setInterval(refresh, 120000)
    return () => {
      mounted.current = false
      clearInterval(interval)
    }
  }, [refresh])

  return (
    <section style={ui.section} aria-label="Rabbit VRF fair launches">
      <div style={ui.heading}>
        <div style={ui.identity}>
          <div style={ui.icon}>
            <ShieldCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <h2 style={ui.title}>Rabbit VRF · Fair Launch</h2>
            <p style={ui.subtitle}>
              Verifiable token allocation before trading begins
            </p>
          </div>
        </div>

        <button
          type="button"
          style={ui.refresh}
          disabled={busy}
          onClick={refresh}
          aria-label="Refresh VRF registrations"
        >
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
          {busy ? 'Checking…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: '#a43232', fontSize: 13 }}>
          Unable to check VRF rounds: {error}
        </p>
      )}

      {!error && rounds.length === 0 && (
        <div style={ui.empty} role="status">
          <ShieldCheck size={17} color="#8064aa" />
          <span>
            {busy
              ? 'Checking available fair launch registrations…'
              : 'No registrations open right now. New fair launches will appear here automatically.'}
          </span>
        </div>
      )}

      {rounds.length > 0 && (
        <div style={ui.grid}>
          {rounds.map(item => (
            <article style={ui.card} key={item.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8
              }}>
                <strong style={{ color: '#251742', fontSize: 15 }}>
                  VRF Launch #{item.id}
                </strong>
                <span style={ui.tag}>Registration Open</span>
              </div>

              <p style={{
                fontSize: 12,
                color: '#72677f',
                overflowWrap: 'anywhere',
                margin: '12px 0'
              }}>
                Token: {item.token}
              </p>

              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: 12,
                color: '#605571'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <Users size={14} />
                  {item.count.toString()} participants
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <Clock3 size={14} />
                  {new Date(Number(item.deadline) * 1000).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                style={ui.action}
                onClick={() => onSelectToken(item.token)}
              >
                View / Join Fair Launch
              </button>

              <a
                href={`${V3.explorer}/address/${item.round}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: '#7136c7',
                  textDecoration: 'none'
                }}
              >
                Verify on Explorer <ArrowUpRight size={13} />
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
