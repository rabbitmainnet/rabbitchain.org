import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Coins, Factory, Flame, Layers3, Repeat2, Rocket, Wallet, Waves } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'

const modules = [
  { icon: Repeat2, tag:'TRADE', title:'Rabbit Swap', text:'Swap Rabbit-native assets through a focused, wallet-connected trading interface.' },
  { icon: Waves, tag:'LIQUIDITY', title:'Liquidity', text:'Create and manage liquidity positions for supported Rabbit markets.' },
  { icon: Flame, tag:'EARN', title:'Launchpool', text:'Discover protocol-approved launch pools and participation campaigns in one place.' },
  { icon: Factory, tag:'CREATE', title:'Token Factory', text:'Deploy standard EVM tokens through a guided interface with transparent contract parameters.' },
  { icon: Layers3, tag:'MOVE', title:'Bridge', text:'A dedicated route for moving supported assets when official bridge infrastructure is available.' },
  { icon: Coins, tag:'PORTFOLIO', title:'Assets', text:'View connected-wallet balances, token activity and Rabbit network links without leaving the portal.' },
]

export default function Platform({ walletState, onConnect }){
  return <main>
    <section className="platform-hero">
      <div className="shell platform-hero-grid">
        <div>
          <span className="page-kicker">RABBIT PLATFORM</span>
          <h1>Use the network.<br/><em>From one place.</em></h1>
          <p>Rabbit Platform is the application layer of the ecosystem — wallet access, swapping, liquidity, launches, token creation and network utilities organized around a single connected experience.</p>
          <div className="hero-ctas">
            <button className="button primary" onClick={onConnect}><Wallet size={16}/>{walletState?.account?'Open wallet':'Connect wallet'}</button>
            <Link className="button secondary" to="/testnet">Network hub <ArrowRight size={15}/></Link>
          </div>
        </div>
        <div className="platform-wallet-card">
          <div className="platform-wallet-top"><span>CONNECTED EXPERIENCE</span><StatusDot tone="launch">RABBIT</StatusDot></div>
          <div className="platform-wallet-identity"><div className="platform-wallet-mark"><img src="/rabbit-mark.png" alt="Rabbit Chain"/></div><div><small>WALLET</small><strong>{walletState?.account ? `${walletState.account.slice(0,6)}…${walletState.account.slice(-4)}` : 'Not connected'}</strong></div></div>
          <div className="platform-wallet-grid"><div><span>NETWORK</span><strong>Rabbit</strong></div><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>ASSET</span><strong>RAB</strong></div></div>
          <button className="platform-connect" onClick={onConnect}>{walletState?.account?'Manage wallet':'Connect to Rabbit'}<ArrowRight size={15}/></button>
        </div>
      </div>
    </section>

    <section className="platform-modules shell">
      <SectionHeader eyebrow="RABBIT APPLICATION LAYER" title="One platform. Multiple ways to use Rabbit." text="The official site remains the protocol and network portal. Rabbit Platform is where wallet-connected applications live." />
      <div className="platform-module-grid">{modules.map(({icon:Icon,tag,title,text})=><article className="platform-module-card" key={title}><div className="platform-module-icon"><Icon size={22}/></div><span>{tag}</span><h3>{title}</h3><p>{text}</p><div className="platform-module-status"><small>MODULE</small><b>COMING WITH NETWORK SERVICES</b></div></article>)}</div>
    </section>

    <section className="platform-architecture">
      <div className="shell platform-architecture-grid">
        <div><span>HOW IT FITS TOGETHER</span><h2>Protocol below.<br/><em>Applications above.</em></h2><p>The website should make the separation obvious: Rabbit Chain runs the protocol and network; Rabbit Platform gives users a friendly way to interact with applications built on top.</p></div>
        <div className="platform-stack">
          <div><small>APPLICATIONS</small><strong>Swap · Launchpool · Factory · Bridge · Portfolio</strong></div>
          <i/>
          <div><small>WALLET & RPC</small><strong>EVM wallet · JSON-RPC · Explorer</strong></div>
          <i/>
          <div><small>EXECUTION</small><strong>EVM · Transactions · Smart contracts</strong></div>
          <i/>
          <div><small>CONSENSUS</small><strong>LCQ · Producer · Committee</strong></div>
          <i/>
          <div><small>NETWORK</small><strong>P2P · Nodes · Mining</strong></div>
        </div>
      </div>
    </section>

    <section className="platform-paths shell">
      <SectionHeader eyebrow="START WITH RABBIT" title="Use, build or operate the network." text="Different visitors should reach the right part of the ecosystem in one or two clicks." />
      <div className="platform-path-grid">
        <Link to="/testnet"><Wallet/><span>USE</span><h3>Connect to Rabbit</h3><p>Wallet, network access, explorer and faucet.</p><b>Open network <ArrowUpRight size={14}/></b></Link>
        <Link to="/developers"><Rocket/><span>BUILD</span><h3>Build applications</h3><p>EVM, JSON-RPC, contracts and developer tooling.</p><b>Developer portal <ArrowUpRight size={14}/></b></Link>
        <Link to="/mining"><Flame/><span>PARTICIPATE</span><h3>Mine Rabbit</h3><p>Run Rabbit and participate through LCQ.</p><b>Mining portal <ArrowUpRight size={14}/></b></Link>
      </div>
    </section>
  </main>
}
