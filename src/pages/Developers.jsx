import { Code2, Database, Boxes, GitBranch } from 'lucide-react'

export default function Developers() {
  const cards=[
    [Code2,'EVM execution','Use familiar smart-contract execution concepts and Ethereum-style application tooling.'],
    [Database,'JSON-RPC','Connect wallets, applications and infrastructure through standard RPC interfaces.'],
    [Boxes,'Two network configs','Target Rabbit Mainnet 928 or Rabbit Testnet 9280 from one central network definition.'],
    [GitBranch,'Open source','Follow Rabbit development, client releases and website changes through the official GitHub organization.']
  ]
  return <div className="page-shell">
    <section className="page-hero"><span>DEVELOPERS / BUILD</span><h1>Build for Mainnet.<br/><em>Validate on Testnet.</em></h1><p>Rabbit keeps the application execution experience familiar while LCQ coordinates block production underneath. Mainnet is the production target; Testnet is the environment for integration and launch validation.</p></section>
    <section className="dev-card-grid">{cards.map(([Icon,title,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p><span>EXPLORE ↗</span></article>)}</section>
    <section className="rpc-section" id="rpc"><div><span>NETWORK CONFIGURATION</span><h2>Mainnet first.<br/><em>Testnet beside it.</em></h2><p>Keep production and public validation endpoints explicit so applications never confuse test assets with the flagship network.</p></div><pre><code><span>export const</span> rabbit = {'{'}{`\n`}  mainnet: {'{'} chainId: <b>928</b>, asset: <em>'RAB'</em> {'}'},{`\n`}  testnet: {'{'} chainId: <b>9280</b>, asset: <em>'RAB'</em> {'}'},{`\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>{`\n`}{'}'}</code></pre></section>
  </div>
}
