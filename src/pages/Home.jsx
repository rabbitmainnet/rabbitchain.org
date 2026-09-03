import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, BookOpen, Braces, CheckCircle2, Code2,
  Cpu, Database, Factory, FileCheck2, FlaskConical, GitBranch, Globe2,
  Layers3, Network, Repeat2, Rocket, ShieldCheck, TerminalSquare, Wallet, Waves,
} from 'lucide-react'
import { NETWORKS } from '../config/networks'
import { usePlatformNetwork } from '../hooks/usePlatformNetwork'
import PlatformNetworkSwitch from '../components/PlatformNetworkSwitch'
import RabbitSwapPanel from '../components/RabbitSwapPanel'


const paths = [
  ['01', Wallet, 'Use Rabbit', 'Connect a wallet, add Testnet and reach official network services.', '/testnet'],
  ['02', Cpu, 'Mine Rabbit', 'Produce valid work and enter LCQ when protocol rules make the wallet eligible.', '/mining'],
  ['03', Database, 'Run Rabbit', 'Join P2P and operate independent node or RPC infrastructure.', '/nodes'],
  ['04', Code2, 'Build on Rabbit', 'Use EVM, JSON-RPC and familiar Ethereum developer tooling.', '/developers'],
]

const verifyRows = [
  [BookOpen, 'Protocol & network docs', 'Network configuration, LCQ, wallets and operator references.', '/docs', false],
  [Code2, 'Official GitHub', 'Source code, project history and public repositories.', 'https://github.com/rabbitmainnet', true],
  [ShieldCheck, 'Security center', 'Official domains, wallet safety and verification guidance.', '/security', false],
  [FileCheck2, 'Release center', 'Verified Windows and Linux Rabbit Core packages with published SHA-256 hashes.', '/releases', false],
]

export default function Home({ walletState, walletProvider, onConnect, onAddNetwork, toast }) {
  const testnet = NETWORKS.testnet
  const {
    platformNetwork,
    setPlatformNetwork,
  } = usePlatformNetwork()

  return (
    <main className="home-page-v13">
      <section className="home-v2-hero">
        <div className="shell home-v2-hero-grid">
          <div className="home-v2-copy">
            <div className="hero-eyebrow"><i /> RABBIT CHAIN · EVM LAYER 1 · LCQ CONSENSUS</div>
            <h1>Fair access to <em>block production.</em></h1>
            <p>Rabbit Chain is a permissionless EVM Layer 1 where valid work can create eligibility and <strong>LCQ coordinates the next producer opportunity.</strong></p>
            <div className="home-v2-manifesto"><span>One wallet</span><i /><span>One fair chance</span></div>
            <div className="hero-ctas">
              <Link className="button primary" to="/testnet">Enter Testnet <ArrowRight size={16} /></Link>
              <Link className="button secondary" to="/platform">Open Platform <ArrowRight size={16} /></Link>
              <Link className="button ghost home-v12-text-link" to="/lcq">Explore LCQ <ArrowRight size={14} /></Link>
            </div>
            <div className="home-v2-facts">
              <div><span>TESTNET</span><strong>9280</strong><small>FIRST PUBLIC NETWORK</small></div>
              <div><span>CONSENSUS</span><strong>LCQ</strong><small>LIVE CONSENSUS QUEUE</small></div>
              <div><span>EXECUTION</span><strong>EVM</strong><small>FAMILIAR TOOLING</small></div>
              <div><span>REWARD</span><strong>70 / 30</strong><small>PRODUCER / COMMITTEE</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-v2-network-strip">
        <div className="shell">
          <div><span>RABBIT TESTNET</span><strong>Chain ID 9280</strong></div>
          <i />
          <div><span>RABBIT MAINNET</span><strong>Chain ID 928</strong></div>
          <i />
          <div><span>BLOCK TARGET</span><strong>~10 seconds</strong></div>
          <i />
          <div><span>NETWORK MODEL</span><strong>Permissionless P2P</strong></div>
        </div>
      </section>

      <section className="home-v2-manifesto-section">
        <div className="shell home-v2-manifesto-grid">
          <div className="home-v2-manifesto-copy">
            <span className="section-kicker">WHY RABBIT</span>
            <h2>No permanent producer class.</h2>
            <p>Rabbit separates participation from permanent control. Valid work can open eligibility, while LCQ coordinates the producer opportunity from protocol state.</p>
            <Link className="inline-link" to="/lcq">Understand LCQ <ArrowRight size={15} /></Link>
          </div>
          <div className="participation-map" aria-label="Rabbit participation model">
            <div className="participation-wallets">
              <div><span>01</span><small>WALLET</small></div>
              <div><span>02</span><small>WALLET</small></div>
              <div className="active"><span>03</span><small>WALLET</small></div>
              <div><span>04</span><small>WALLET</small></div>
              <div><span>05</span><small>WALLET</small></div>
            </div>
            <div className="participation-flow">
              <div><GitBranch size={18} /><span>VALID WORK</span><strong>participation</strong></div>
              <b>→</b>
              <div className="accent"><Network size={18} /><span>LCQ</span><strong>coordination</strong></div>
              <b>→</b>
              <div><Braces size={18} /><span>BLOCK</span><strong>production</strong></div>
            </div>
            <p>Every eligible participant enters the same protocol-defined coordination path.</p>
          </div>
        </div>
      </section>

      <section className="home-v2-lcq">
        <div className="shell">
          <div className="home-v2-lcq-head">
            <div><span className="section-kicker">LIVE CONSENSUS QUEUE</span><h2>One visible path from work to the next block.</h2></div>
            <p>Rabbit keeps the application surface familiar while making producer coordination explicit inside the protocol.</p>
          </div>

          <div className="consensus-path-v3" aria-label="Rabbit LCQ consensus path">
            <article><span>01</span><small>WORK</small><h3>Valid work</h3><p>Accepted work opens the participation path.</p></article>
            <article><span>02</span><small>ELIGIBILITY</small><h3>Qualify</h3><p>Protocol state resolves who can enter coordination.</p></article>
            <article className="active"><span>03</span><small>LCQ</small><h3>Resolve next</h3><p>The live queue orders eligible participants deterministically.</p></article>
            <article><span>04</span><small>PRODUCER</small><h3>Produce</h3><p>The selected wallet receives the next block opportunity.</p></article>
            <article><span>05</span><small>COMMITTEE</small><h3>Complete</h3><p>Committee participation completes consensus and rewards.</p></article>
          </div>

          <div className="home-v2-reward">
            <div className="home-v2-reward-copy"><span>BLOCK ECONOMICS</span><strong>One block. Two consensus roles.</strong><p>The protocol recognizes producer and committee participation explicitly.</p></div>
            <div className="reward-meter" aria-label="70 percent producer and 30 percent committee reward split">
              <div className="producer"><b>70%</b><span>PRODUCER</span></div>
              <div className="committee"><b>30%</b><span>COMMITTEE</span></div>
            </div>
          </div>
          <Link className="inline-link light-link" to="/lcq">Deep dive into LCQ <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="home-platform-final home-platform-swap-only">
        <div className="shell">

          <div className="home-platform-final-head">
            <div>
              <span className="section-kicker">
                RABBIT PLATFORM
              </span>

              <h2>
                One network. One official application layer.
              </h2>
            </div>

            <div className="home-platform-final-intro">
              <p>
                Wallet-connected network utilities in one coherent
                product surface. The same official Swap interface is
                available here and inside Rabbit Platform.
              </p>

              <Link className="button primary" to="/platform">
                Explore Platform <span>→</span>
              </Link>
            </div>
          </div>

          <div className="home-platform-swap-stage">

            <div className="home-platform-swap-network">
              <span>APPLICATION NETWORK</span>

              <PlatformNetworkSwitch
                value={platformNetwork}
                onChange={setPlatformNetwork}
              />
            </div>

            <RabbitSwapPanel
              networkKey={platformNetwork}
              walletState={walletState}
              walletProvider={walletProvider}
              onConnect={onConnect}
              onSwitchNetwork={onAddNetwork}
              toast={toast}
              variant="home"
            />

          </div>

        </div>
      </section>

      <section className="home-v2-paths">
        <div className="shell">
          <div className="home-v2-paths-head"><span className="section-kicker">START HERE</span><h2>Use. Mine. Operate. Build.</h2><p>Every visitor should reach the right Rabbit workflow in one clear step.</p></div>
          <div className="path-rows">
            {paths.map(([number, Icon, title, text, to]) => (
              <Link to={to} key={number}>
                <span>{number}</span><div className="path-row-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-v2-testnet">
        <div className="shell home-v2-testnet-grid">
          <div className="testnet-number"><span>FIRST PUBLIC NETWORK</span><strong>9280</strong><small>RABBIT TESTNET</small></div>
          <div className="testnet-copy"><span className="section-kicker">PUBLIC TESTNET LIVE</span><h2>Connect, build, run a node and mine.</h2><p>Rabbit Testnet provides public P2P discovery, HTTPS RPC, WebSocket RPC, the official explorer, verified Rabbit Core downloads and a participant faucet for miners, builders and testers. New wallets earn their first tRAB by mining.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Testnet hub <ArrowRight size={15} /></Link><button className="button secondary" onClick={() => onAddNetwork(testnet)}>Add Testnet</button></div></div>
          <div className="testnet-status-table">
            <div><Wallet size={17} /><span>Wallet connection</span><b className="ready">LIVE</b></div>
            <div><Network size={17} /><span>Chain configuration</span><b className="ready">9280</b></div>
            <div><TerminalSquare size={17} /><span>Official RPC</span><b>{testnet.publicRpcReady ? 'LIVE' : 'RESERVED'}</b></div>
            <div><Globe2 size={17} /><span>Explorer</span><b>{testnet.publicExplorerReady ? 'LIVE' : 'RESERVED'}</b></div>
            <div><FlaskConical size={17} /><span>Faucet</span><b className="ready">LIVE</b></div>
            <div><Cpu size={17} /><span>Rabbit Core downloads</span><b>LIVE</b></div>
          </div>
        </div>
      </section>

      <section className="home-v2-verify">
        <div className="shell home-v2-verify-grid">
          <div><span className="section-kicker">TRUST MODEL</span><h2>Verify, don’t trust.</h2><p>Source, documentation, security guidance and releases belong under one official domain and should be independently verifiable.</p></div>
          <div className="verify-rows">
            {verifyRows.map(([Icon, title, text, to, external]) => (
              external ? (
                <a href={to} target="_blank" rel="noreferrer" key={title}><Icon size={19} /><span><b>{title}</b><small>{text}</small></span><ArrowUpRight size={16} /></a>
              ) : (
                <Link to={to} key={title}><Icon size={19} /><span><b>{title}</b><small>{text}</small></span><ArrowRight size={16} /></Link>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="final-banner">
        <div className="shell final-banner-inner">
          <div><img src="/rabbit-mark.png" alt="Rabbit Chain" /><span>RABBIT CHAIN</span></div>
          <h2>One wallet. <em>One fair chance.</em></h2>
          <p>Join the public Testnet, verify the network and follow the path to Mainnet.</p>
          <div className="hero-ctas"><button className="button light" onClick={() => onAddNetwork(testnet)}>Add Rabbit Testnet</button><Link className="button dark-outline" to="/platform">Explore Platform <ArrowRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  )
}
