import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, FlaskConical, Globe2, Radio, Wallet } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { NETWORKS } from '../config/networks'
import { RELEASE } from '../config/release'

const Service = ({ Icon, label, value, live }) => (
  <article className="status-card"><div><Icon size={19} /><span>{label}</span></div><strong>{value}</strong><b className={live ? 'live' : ''}>{live ? 'LIVE' : 'RESERVED'}</b></article>
)

export default function Status() {
  const t = NETWORKS.testnet
  return (
    <main>
      <section className="page-hero status-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> NETWORK STATUS · SOURCE OF TRUTH</span><h1>Know what is <em>actually available.</em></h1><p>Every public Rabbit service stays explicitly labeled. Reserved domains are not presented as live infrastructure.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Testnet hub <ArrowRight size={15} /></Link><Link className="button secondary" to="/nodes">Run a node</Link></div></div><div className="status-overview"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT TESTNET</b><small>CHAIN ID 9280</small></span><em>{RELEASE.testnetLive ? 'LIVE' : 'PRE-LAUNCH'}</em></div><section><span><b>CONSENSUS</b>LCQ</span><span><b>EXECUTION</b>EVM</span><span><b>NETWORK</b>P2P</span><span><b>MAINNET</b>After Testnet</span></section></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="PUBLIC SERVICES" title="One page for the official launch surface." text="Wallet integration can be ready while public RPC, explorer and faucet services remain reserved." /><div className="status-service-grid"><Service Icon={Wallet} label="Wallet connection" value="Injected + WalletConnect" live /><Service Icon={Radio} label="JSON-RPC" value={t.rpcUrl} live={t.publicRpcReady} /><Service Icon={Radio} label="WebSocket" value={t.wsUrl} live={t.publicRpcReady} /><Service Icon={Globe2} label="Explorer" value={t.explorerUrl} live={t.publicExplorerReady} /><Service Icon={FlaskConical} label="Faucet" value={t.faucetUrl} live={t.publicFaucetReady} /></div></section>
      <section className="status-launch-note"><div className="shell status-launch-note-grid"><div><Clock3 size={26} /><span>LAUNCH MODEL</span><h2>Testnet first. Mainnet after validation.</h2></div><div><p>Rabbit Mainnet, Chain ID 928, remains a separate production milestone and is not presented as live until its own release gates are completed.</p><Link to="/mainnet">View Mainnet path <ArrowRight size={14} /></Link></div></div></section>
    </main>
  )
}
