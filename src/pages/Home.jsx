import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Code2, Cpu, Globe2, Network, ShieldCheck, Wallet } from 'lucide-react'
import HeroEngine from '../components/HeroEngine'
import NetworkPanel from '../components/NetworkPanel'

const lcqSteps=[
  ['01','WORK','A participant produces valid work under network rules.'],
  ['02','ELIGIBILITY','The protocol determines who is eligible to enter producer coordination.'],
  ['03','LCQ','Eligible wallets are organized through Live Consensus Queue.'],
  ['04','PRODUCER','The selected wallet receives the next block-production opportunity.'],
  ['05','COMMITTEE','Producer and committee roles complete the consensus flow.']
]

export default function Home({ walletState, onConnect, onSwitch, toast }) {
  return <>
    <section className="hero-v7">
      <div className="hero-v7-copy">
        <div className="mainnet-kicker"><i/>FLAGSHIP NETWORK · MAINNET 928</div>
        <h1>Fair block production.<br/><em>Built into the protocol.</em></h1>
        <p>Rabbit Chain is a permissionless EVM Layer 1 powered by <b>LCQ Consensus</b>. The public testnet comes first. <strong>Mainnet is the network the protocol is ultimately built to serve.</strong></p>
        <div className="hero-v7-actions">
          <Link className="cta-dark" to="/network?network=mainnet">EXPLORE MAINNET <ArrowRight size={16}/></Link>
          <Link className="cta-light" to="/network?network=testnet">VIEW TESTNET</Link>
          <button className="cta-wallet" onClick={onConnect}><Wallet size={15}/>{walletState.account?'OPEN WALLET':'CONNECT WALLET'}</button>
        </div>
        <div className="hero-principle"><span>RABBIT PRINCIPLE</span><b>One wallet. One fair chance.</b></div>
      </div>
      <div className="hero-v7-visual"><HeroEngine/></div>
    </section>

    <section className="mainnet-rail">
      <div className="mainnet-rail-title"><span>RABBIT MAINNET</span><b>Primary network</b></div>
      <div><span>CHAIN ID</span><b>928</b></div>
      <div><span>CONSENSUS</span><b>LCQ</b></div>
      <div><span>EXECUTION</span><b>EVM</b></div>
      <div><span>NATIVE ASSET</span><b>RAB</b></div>
      <div className="rail-status"><i/>COMING AFTER TESTNET</div>
    </section>

    <section className="intro-v7">
      <div className="intro-v7-number">01</div>
      <div className="intro-v7-main"><span>WHY RABBIT</span><h2>A Layer 1 centered on <em>who gets the next block.</em></h2></div>
      <div className="intro-v7-copy"><p>Most network homepages lead with raw throughput. Rabbit leads with its consensus model: open participation, protocol-defined eligibility and deterministic producer coordination through LCQ.</p><Link to="/lcq">UNDERSTAND LCQ <ArrowUpRight size={15}/></Link></div>
    </section>

    <section className="lcq-v7">
      <div className="section-head-v7"><span>02 / LIVE CONSENSUS QUEUE</span><h2>From proof of participation<br/>to <em>producer opportunity.</em></h2><p>Five protocol roles, one continuous flow. No black-box dashboard and no manually curated producer list.</p></div>
      <div className="lcq-timeline-v7">
        {lcqSteps.map(([n,title,text],i)=><div className="lcq-step-v7" key={n}><div className="lcq-step-line"><span>{n}</span>{i<lcqSteps.length-1&&<i/>}</div><div><b>{title}</b><p>{text}</p></div></div>)}
      </div>
      <div className="economics-v7">
        <div><span>BLOCK REWARD MODEL</span><h3>One block.<br/>Two consensus roles.</h3></div>
        <div className="economics-bars"><div className="econ-producer"><strong>70%</strong><span>PRODUCER</span></div><div className="econ-committee"><strong>30%</strong><span>COMMITTEE</span></div></div>
      </div>
    </section>

    <section className="mainnet-feature-v7">
      <div className="mainnet-feature-copy"><span>03 / RABBIT MAINNET</span><h2>The flagship network<br/>is the <em>main event.</em></h2><p>The testnet is the public proving ground. Mainnet is presented as the primary Rabbit network from day one, so users understand the long-term destination immediately.</p><div className="mainnet-feature-actions"><Link to="/network?network=mainnet">MAINNET DETAILS <ArrowRight size={15}/></Link><Link to="/docs">NETWORK PARAMETERS</Link></div></div>
      <div className="mainnet-spec-card">
        <div className="msc-top"><img src="/rabbit-mark.png" alt=""/><span>RABBIT MAINNET</span><em>COMING SOON</em></div>
        <div className="msc-chain"><small>CHAIN ID</small><strong>928</strong></div>
        <div className="msc-grid"><div><span>Consensus</span><b>LCQ</b></div><div><span>Execution</span><b>EVM</b></div><div><span>Asset</span><b>RAB</b></div><div><span>Network</span><b>P2P</b></div></div>
        <div className="msc-endpoint"><span>RPC</span><b>rpc.rabbitchain.org</b><em>RESERVED</em></div>
        <div className="msc-endpoint"><span>Explorer</span><b>explorer.rabbitchain.org</b><em>RESERVED</em></div>
      </div>
    </section>

    <section className="network-hub-v7">
      <div className="section-head-v7"><span>04 / NETWORK HUB</span><h2>Mainnet first.<br/><em>Testnet beside it.</em></h2><p>One portal, two environments. Mainnet remains visually primary while the testnet carries the public launch and validation workflow.</p></div>
      <NetworkPanel onConnect={onConnect} onSwitch={onSwitch} walletState={walletState} toast={toast}/>
    </section>

    <section className="entry-v7">
      <div className="section-head-v7"><span>05 / ENTER THE NETWORK</span><h2>Use Rabbit your way.</h2></div>
      <div className="entry-grid-v7">
        <Link to="/mining" className="entry-card-v7"><Cpu/><span>MINERS</span><h3>Mine Rabbit</h3><p>Run the official client, generate valid work and participate in LCQ.</p><b>START MINING <ArrowUpRight size={14}/></b></Link>
        <Link to="/mining#node" className="entry-card-v7"><Network/><span>NODE OPERATORS</span><h3>Run infrastructure</h3><p>Join P2P, sync the chain and operate independent Rabbit infrastructure.</p><b>RUN A NODE <ArrowUpRight size={14}/></b></Link>
        <Link to="/developers" className="entry-card-v7"><Code2/><span>BUILDERS</span><h3>Build with EVM</h3><p>Use familiar Ethereum execution tooling with Rabbit consensus underneath.</p><b>DEVELOPER PORTAL <ArrowUpRight size={14}/></b></Link>
        <Link to="/network?network=testnet" className="entry-card-v7"><Globe2/><span>TESTNET</span><h3>Explore before mainnet</h3><p>Use the public environment for wallet, faucet, explorer and node validation.</p><b>TESTNET HUB <ArrowUpRight size={14}/></b></Link>
      </div>
    </section>

    <section className="developer-v7">
      <div className="developer-v7-copy"><span>06 / DEVELOPERS</span><h2>Ethereum execution.<br/><em>Rabbit coordination.</em></h2><p>Keep the developer surface familiar while the network differentiates itself at consensus.</p><Link to="/developers">BUILD ON RABBIT <ArrowRight size={15}/></Link></div>
      <div className="developer-terminal-v7"><div className="dt-head"><span>rabbit.network.ts</span><i/><i/><i/></div><pre><code><span>export const</span> rabbitMainnet = {'{'}{`\n`}  chainId: <b>928</b>,{`\n`}  nativeCurrency: <em>'RAB'</em>,{`\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>,{`\n`}  status: <em>'coming-soon'</em>{`\n`}{'}'}</code></pre></div>
    </section>

    <section className="final-v7"><img src="/rabbit-mark.png" alt="Rabbit Chain"/><span>RABBIT CHAIN</span><h2>Test in public.<br/><em>Launch the flagship.</em></h2><p>Rabbit Testnet validates the path. Rabbit Mainnet remains the primary network and destination.</p><div><Link className="cta-dark" to="/network?network=mainnet">EXPLORE MAINNET <ArrowRight size={15}/></Link><Link className="cta-light" to="/network?network=testnet">OPEN TESTNET</Link></div></section>
  </>
}
