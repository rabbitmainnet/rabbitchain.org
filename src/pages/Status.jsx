import { useEffect, useState } from 'react'
import ReleaseNotice from '../components/ReleaseNotice'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, FlaskConical, Globe2, Radio, Repeat2, Wallet, Waves } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { NETWORKS } from '../config/networks'
import { RELEASE } from '../config/release'

const Service = ({ Icon, label, value, status }) => (
  <article className="status-card">
    <div><Icon size={19} /><span>{label}</span></div>
    <strong>{value}</strong>
    <b className={status === 'RESPONDING' || status === 'BETA' ? 'live' : ''}>{status}</b>
  </article>
)

export default function Status() {
  const t = NETWORKS.testnet
  const [probe, setProbe] = useState({ state: 'CHECKING', head: null, peers: null, syncing: null, checkedAt: null })
  useEffect(() => {
    let active = true
    let controller
    async function check() {
      controller?.abort()
      controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10000)
      try {
        const methods = ['eth_chainId', 'eth_blockNumber', 'net_peerCount', 'eth_syncing']
        const response = await fetch(t.rpcUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methods.map((method, id) => ({ jsonrpc: '2.0', id, method, params: [] }))),
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('RPC unavailable')
        const rows = await response.json()
        if (!Array.isArray(rows)) throw new Error('Invalid RPC response')
        const values = methods.map((_, id) => {
          const row = rows.find(item => item.id === id)
          if (!row || row.error || !Object.hasOwn(row, 'result')) throw new Error('RPC method failed')
          return row.result
        })
        const [chain, head, peers, syncing] = values
        if (!/^0x[0-9a-f]+$/i.test(chain) || Number.parseInt(chain, 16) !== t.chainId ||
            !/^0x[0-9a-f]+$/i.test(head) || !/^0x[0-9a-f]+$/i.test(peers) ||
            !(syncing === false || (syncing && typeof syncing === 'object'))) throw new Error('Unexpected network')
        if (active) setProbe({ state: 'RESPONDING', head: Number.parseInt(head, 16), peers: Number.parseInt(peers, 16), syncing, checkedAt: new Date() })
      } catch {
        if (active) setProbe({ state: 'UNAVAILABLE', head: null, peers: null, syncing: null, checkedAt: new Date() })
      } finally { clearTimeout(timer) }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => { active = false; clearInterval(interval); controller?.abort() }
  }, [t.rpcUrl, t.chainId])
  return (
    <main>
      <ReleaseNotice />
      <section className="page-hero status-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> NETWORK STATUS · SOURCE OF TRUTH</span><h1>Know what is <em>actually available.</em></h1><p>This page samples the public RPC every 30 seconds. Rabbit Core V2.4.8 includes authenticated VRF relay without a new hard fork. The V5 mining reward correction remains active from block 153,601. VRF protocol activation and completed request fulfillment are separate checks.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Testnet hub <ArrowRight size={15} /></Link><Link className="button secondary" to="/nodes">Run a node</Link></div></div><div className="status-overview"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT TESTNET</b><small>CHAIN ID 9280</small></span><em>{RELEASE.testnetLive ? 'LIVE' : 'PRE-LAUNCH'}</em></div><section><span><b>CONSENSUS</b>LCQ</span><span><b>EXECUTION</b>EVM</span><span><b>NETWORK</b>P2P</span><span><b>MAINNET</b>After Testnet</span></section></div></div></section>
      <section className="section shell">
        <SectionHeader
          eyebrow="PUBLIC SERVICES"
          title="Rabbit Testnet public service status."
          text="RPC status comes from the latest browser check. Other labels describe configured services, not continuous health monitoring. Swap and Liquidity remain experimental Testnet Beta services."
        />
        <p>VRF availability V2 at block {RELEASE.vrfAvailabilityV2Block.toLocaleString('en-US')}: {probe.head === null ? 'waiting for RPC height' : probe.head >= RELEASE.vrfAvailabilityV2Block ? 'activation height reached; request fulfillment must still be verified' : 'activation height not yet reached'}.</p>
        <p role="status" aria-live="polite">
          {probe.state === 'RESPONDING'
            ? `Observed block ${probe.head.toLocaleString('en-US')} · ${probe.peers} peers · ${probe.syncing === false ? 'RPC node reports synchronized' : 'RPC node reports syncing'}. A responding endpoint does not by itself prove ongoing block production.`
            : probe.state === 'CHECKING' ? 'Checking public RPC…' : 'Public RPC check failed. A network or browser access error may prevent this check; retrying automatically.'}
          {probe.checkedAt && ` Last checked: ${probe.checkedAt.toLocaleTimeString()}.`}
        </p>
        <div className="status-service-grid">
          <Service Icon={Wallet} label="Wallet connection" value="Injected + WalletConnect" status="SUPPORTED" />
          <Service Icon={Radio} label="JSON-RPC" value={t.rpcUrl} status={probe.state} />
          <Service Icon={Radio} label="WebSocket" value={t.wsUrl} status={t.publicWsReady ? 'CONFIGURED' : 'OFFLINE'} />
          <Service Icon={Globe2} label="Explorer" value={t.explorerUrl} status={t.publicExplorerReady ? 'CONFIGURED' : 'OFFLINE'} />
          <Service Icon={Repeat2} label="Rabbit Swap" value="tRAB · tWRAB · tRUSD" status={t.platform.swapLive ? 'BETA' : 'OFFLINE'} />
          <Service Icon={Waves} label="Liquidity" value="tWRAB / tRUSD reference pool" status={t.platform.liquidityLive ? 'BETA' : 'OFFLINE'} />
          <Service Icon={FlaskConical} label="Faucet" value="tRAB + tRUSD" status={t.publicFaucetReady ? 'CONFIGURED' : 'OFFLINE'} />
        </div>
      </section>
      <section className="status-launch-note"><div className="shell status-launch-note-grid"><div><Clock3 size={26} /><span>LAUNCH MODEL</span><h2>Testnet first. Mainnet after validation.</h2></div><div><p>Rabbit Mainnet, Chain ID 928, remains a separate production milestone and is not presented as live until its own release gates are completed.</p><Link to="/mainnet">View Mainnet path <ArrowRight size={14} /></Link></div></div></section>
    </main>
  )
}
