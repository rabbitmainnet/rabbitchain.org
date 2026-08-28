import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Code2, Cpu, FlaskConical, Globe2, Network, Plus, Radio, ShieldCheck, Wallet } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import CopyButton from '../components/CopyButton'
import { NETWORKS } from '../config/networks'

export default function Testnet({ walletState, onConnect, onAddNetwork }) {
  const n = NETWORKS.testnet
  return (
    <main>
      <section className="page-hero testnet-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> FIRST PUBLIC NETWORK · CHAIN ID 9280</span>
            <h1>Rabbit Testnet is the <em>public launch path.</em></h1>
            <p>Miners, node operators, wallets and developers use the Testnet to validate the complete Rabbit network before Mainnet.</p>
            <div className="hero-ctas"><button className="button primary" onClick={onConnect}><Wallet size={16} />{walletState.account ? 'Manage wallet' : 'Connect wallet'}</button><button className="button secondary" onClick={() => onAddNetwork(n)}><Plus size={15} />Add Rabbit Testnet</button></div>
            <div className="wallet-note"><ShieldCheck size={16} /><span>The site uses your wallet's native EVM add/switch flow. Rabbit never asks for a seed phrase or private key.</span></div>
          </div>
          <div className="network-summary-card">
            <div className="network-summary-head"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT TESTNET</b><small>FIRST PUBLIC NETWORK</small></span></div><em>{n.networkLive ? 'LIVE' : 'PRE-LAUNCH'}</em></div>
            <div className="network-summary-grid"><div><span>CHAIN ID</span><strong>9280</strong></div><div><span>HEX</span><strong>0x2440</strong></div><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>NATIVE ASSET</span><strong>RAB</strong></div><div><span>TEST ASSET</span><strong>RUSD</strong></div></div>
            <div className="network-summary-foot"><span><i className="dot-ready" /> Wallet integration ready</span><span><i /> Public services activate separately</span></div>
          </div>
        </div>
      </section>

      <section className="section shell" id="wallet">
        <SectionHeader eyebrow="QUICK START" title="Five steps into Rabbit Testnet." text="The public entry path should be obvious, verifiable and available from one official domain." />
        <div className="quick-start-grid">
          <article><span>01</span><Wallet size={21} /><h3>Connect wallet</h3><p>Use an installed EVM wallet or WalletConnect. Connection alone requests no signature.</p><button onClick={onConnect}>{walletState.account ? 'Manage wallet' : 'Connect wallet'} <ArrowRight size={14} /></button></article>
          <article><span>02</span><Plus size={21} /><h3>Add Testnet</h3><p>Add Chain ID 9280 and the official Rabbit RPC configuration through your wallet.</p><button onClick={() => onAddNetwork(n)}>Add network <ArrowRight size={14} /></button></article>
          <article><span>03</span><FlaskConical size={21} /><h3>Get RAB / RUSD</h3><p>Test assets come from the official faucet after the service is activated.</p>{n.publicFaucetReady ? <a href={n.faucetUrl} target="_blank" rel="noreferrer">Open faucet <ArrowRight size={14} /></a> : <button disabled>Faucet reserved</button>}</article>
          <article><span>04</span><Globe2 size={21} /><h3>Inspect the chain</h3><p>Blocks, transactions, addresses and contracts appear in the official explorer.</p>{n.publicExplorerReady ? <a href={n.explorerUrl} target="_blank" rel="noreferrer">Open explorer <ArrowRight size={14} /></a> : <button disabled>Explorer reserved</button>}</article>
          <article><span>05</span><Cpu size={21} /><h3>Mine or operate</h3><p>Verify official releases, run Rabbit and participate in the public network.</p><Link to="/mining">Mining path <ArrowRight size={14} /></Link></article>
        </div>
      </section>

      <section className="endpoint-section">
        <div className="shell">
          <SectionHeader eyebrow="OFFICIAL ENDPOINTS" title="Reserved domains, explicit readiness." text="The domain names can be published before the services are live. Every endpoint keeps its real status visible." />
          <div className="endpoint-table">
            <div className="endpoint-row"><span><Radio size={16} />JSON-RPC</span><code>{n.rpcUrl}</code><em>{n.publicRpcReady ? 'LIVE' : 'RESERVED'}</em><CopyButton value={n.rpcUrl} /></div>
            <div className="endpoint-row"><span><Network size={16} />WebSocket</span><code>{n.wsUrl}</code><em>{n.publicWsReady ? 'LIVE' : 'RESERVED'}</em><CopyButton value={n.wsUrl} /></div>
            <div className="endpoint-row"><span><Globe2 size={16} />Explorer</span><code>{n.explorerUrl}</code><em>{n.publicExplorerReady ? 'LIVE' : 'RESERVED'}</em><CopyButton value={n.explorerUrl} /></div>
            <div className="endpoint-row"><span><FlaskConical size={16} />Faucet</span><code>{n.faucetUrl}</code><em>{n.publicFaucetReady ? 'LIVE' : 'RESERVED'}</em><CopyButton value={n.faucetUrl} /></div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader eyebrow="PUBLIC VALIDATION" title="Four tracks need to work together." text="Rabbit Testnet is not just an app developer environment. It exercises consensus, P2P, wallets and infrastructure together." />
        <div className="validation-grid">
          <Link to="/mining"><Cpu size={21} /><span>MINERS</span><h3>LCQ participation</h3><p>Work, eligibility, queue behavior, producer opportunities and rewards.</p><b>Mining path <ArrowRight size={14} /></b></Link>
          <Link to="/nodes"><Network size={21} /><span>OPERATORS</span><h3>P2P infrastructure</h3><p>Peer discovery, synchronization, restart behavior and independent RPC.</p><b>Node path <ArrowRight size={14} /></b></Link>
          <button onClick={onConnect}><Wallet size={21} /><span>WALLETS</span><h3>User integration</h3><p>Chain addition, switching, balances, transfers and public address visibility.</p><b>Connect wallet <ArrowRight size={14} /></b></button>
          <Link to="/developers"><Code2 size={21} /><span>BUILDERS</span><h3>EVM compatibility</h3><p>Contracts, JSON-RPC, transactions and familiar developer tooling.</p><b>Developer path <ArrowRight size={14} /></b></Link>
        </div>
      </section>

      <section className="safety-section"><div className="shell safety-grid"><div><ShieldCheck size={28} /><span>TESTNET SAFETY</span><h2>Test assets are not Mainnet assets.</h2></div><div><p>tRAB and RUSD are for testing only. Verify software and endpoints from rabbitchain.org and the official Rabbit GitHub.</p><div className="safety-points"><span><CheckCircle2 size={15} />No seed phrase requested</span><span><CheckCircle2 size={15} />No Mainnet value on faucet</span><span><CheckCircle2 size={15} />Service status shown explicitly</span></div></div></div></section>
    </main>
  )
}
