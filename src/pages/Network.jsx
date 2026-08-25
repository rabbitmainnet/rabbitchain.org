import NetworkPanel from '../components/NetworkPanel'

export default function Network({ walletState, onConnect, onSwitch, toast }) {
  return <div className="page-shell-v7">
    <section className="page-hero-v7 network-page-hero-v7">
      <div><span>RABBIT NETWORKS</span><h1>Mainnet is the flagship.<br/><em>Testnet gets us there.</em></h1><p>Rabbit Chain is presented around its production network first, while the public testnet provides the environment for validating mining, nodes, wallets, RPC and developer flows before mainnet launch.</p></div>
      <div className="page-mainnet-badge"><small>PRIMARY NETWORK</small><strong>928</strong><b>Rabbit Mainnet</b><span>COMING SOON</span></div>
    </section>
    <section className="network-page-panel-v7"><NetworkPanel onConnect={onConnect} onSwitch={onSwitch} walletState={walletState} toast={toast}/></section>
    <section className="network-roles-v7"><div><span>MAINNET</span><h2>Production network</h2><p>The flagship Rabbit Chain environment for real network activity after launch.</p></div><div><span>TESTNET</span><h2>Public proving ground</h2><p>Used to validate client releases, wallet integration, RPC, explorer, faucet and operational procedures first.</p></div></section>
  </div>
}
