import { ArrowRight, Clock3, Globe2, Radio, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'
import { NETWORKS } from '../config/networks'
import { RELEASE } from '../config/release'

function Service({icon:Icon,title,value,live}){
  return <article className="status-service-card">
    <div><Icon size={19}/><span>{title}</span></div>
    <strong>{value}</strong>
    <StatusDot tone={live?'launch':undefined}>{live?'LIVE':'RESERVED'}</StatusDot>
  </article>
}

export default function Status(){
  const t=NETWORKS.testnet
  return <main>
    <section className="page-hero status-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="launch">NETWORK STATUS</StatusDot><span className="page-kicker notranslate" translate="no">RABBIT CHAIN · PUBLIC NETWORKS</span><h1>Know what is <em>actually available.</em></h1><p>This page is the source of truth for the official Rabbit network surfaces exposed by this portal. Services remain marked Reserved until they are intentionally opened to the public.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Testnet hub <ArrowRight size={15}/></Link><Link className="button secondary" to="/nodes">Run a node</Link></div></div><div className="network-detail-card"><div className="network-detail-top"><img src="/rabbit-mark.png" alt="Rabbit Chain"/><div className="notranslate" translate="no"><span>RABBIT TESTNET</span><b>CHAIN ID 9280</b></div><StatusDot tone={RELEASE.testnetLive?'launch':undefined}>{RELEASE.testnetLive?'LIVE':'COMING SOON'}</StatusDot></div><div className="network-detail-grid"><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>NETWORK</span><strong>P2P</strong></div><div><span>RPC</span><strong>{t.publicRpcReady?'LIVE':'RESERVED'}</strong></div><div><span>EXPLORER</span><strong>{t.publicExplorerReady?'LIVE':'RESERVED'}</strong></div><div><span>FAUCET</span><strong>{t.publicFaucetReady?'LIVE':'RESERVED'}</strong></div></div></div></div></section>

    <section className="page-section shell"><SectionHeader eyebrow="PUBLIC SERVICES" title="One status page for the official launch surface." text="Users should not have to guess whether an endpoint, explorer or faucet is ready. The portal exposes each service only when its launch flag is enabled."/><div className="status-service-grid"><Service icon={Radio} title="JSON-RPC" value={t.rpcUrl} live={t.publicRpcReady}/><Service icon={Radio} title="WebSocket" value={t.wsUrl} live={t.publicRpcReady}/><Service icon={Globe2} title="Explorer" value={t.explorerUrl} live={t.publicExplorerReady}/><Service icon={ShieldCheck} title="Faucet" value={t.faucetUrl} live={t.publicFaucetReady}/></div></section>

    <section className="status-launch-note"><div className="shell status-launch-note-grid"><div><Clock3 size={28}/><span>LAUNCH MODEL</span><h2>Testnet first. Mainnet after validation.</h2></div><div><p>Rabbit Testnet is the first public network. Rabbit Mainnet, Chain ID 928, remains a separate production milestone and is not presented as live until its own release gates are completed.</p><Link to="/mainnet">View Mainnet path →</Link></div></div></section>
  </main>
}
