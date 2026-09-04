import LegalPage from '../components/LegalPage'

const sections=[
  {id:'acceptance',title:'Acceptance of Terms',paragraphs:['These Terms govern access to and use of official Rabbit Chain websites, documentation, network interfaces and other official services. By using them, you acknowledge that you have read and understood these Terms and agree to comply with them.']},
  {id:'project',title:'Nature of Rabbit Chain',paragraphs:[
    'Rabbit Chain is open-source, permissionless blockchain infrastructure built around EVM execution and LCQ Consensus. The public Rabbit Testnet is live and precedes Mainnet so that network behavior, mining, nodes, applications and infrastructure can be validated publicly before the production network launches.',
    'Testnet software, parameters, balances and services are experimental and may be reset, upgraded, modified or discontinued. Testnet assets are not Mainnet assets and should not be treated as having guaranteed economic value.'
  ]},
  {id:'custody',title:'No custody and wallet responsibility',paragraphs:[
    'Rabbit Chain does not take custody of your wallet, private keys or seed phrase through ordinary use of the official website. You are solely responsible for protecting your wallets, devices, credentials and signing decisions.',
    'Blockchain transactions may be irreversible once confirmed. The project cannot recover assets lost because of incorrect addresses, compromised keys, malicious approvals, incompatible software or user error.'
  ]},
  {id:'services',title:'Use of official services',paragraphs:[
    'You may use official services for lawful purposes such as reading documentation, connecting compatible wallets, viewing network information, using public endpoints when enabled, running Rabbit software and building applications.',
    'Official websites, RPC endpoints, explorers, faucets, downloads and application modules may be rate-limited, changed, temporarily unavailable or discontinued. Users operating critical infrastructure should not depend on a single hosted endpoint.'
  ]},
  {id:'platform',title:'Rabbit Platform and future modules',paragraphs:[
    'Rabbit Platform may present modules such as Swap, Liquidity, Staking, Bridge, P2P, Launchpool, Token Factory or the Testnet Faucet. A module shown as preview, planned, reserved or coming soon is not an active service and should not be relied on as available functionality.',
    'When application modules become active, additional module-specific terms, smart-contract disclosures or transaction confirmations may apply.'
  ]},
  {id:'risks',title:'Risks and no guarantees',paragraphs:['Use of blockchain infrastructure involves technical, wallet, software, smart-contract, network, economic, legal and third-party risks. Nothing on the website guarantees uninterrupted service, profitability, token price, liquidity, exchange listing, mining rewards, future adoption or Mainnet launch on a specific date.']},
  {id:'prohibited',title:'Prohibited activity',paragraphs:['You may not use official Rabbit Chain services to conduct unlawful activity, fraud, malicious attacks, unauthorized access, service disruption, impersonation, malware distribution or other activity intended to harm users, infrastructure or the network.']},
  {id:'ip',title:'Open source and intellectual property',paragraphs:['Rabbit Chain source code is governed by the licenses applicable to each repository. Rabbit Chain names, logos, visual identity, documentation and other brand assets may be protected separately. Do not use them in a way that falsely represents an unofficial product, token, service or account as officially endorsed by Rabbit Chain.']},
  {id:'disclaimer',title:'Disclaimers',paragraphs:['Official services are provided on an “as is” and “as available” basis to the maximum extent permitted by law. Websites, documentation, explorer data, RPC responses and application interfaces may contain delays, bugs or inaccuracies. Nothing published by Rabbit Chain constitutes financial, investment, legal or tax advice.']},
  {id:'liability',title:'Limitation of liability',paragraphs:['To the maximum extent permitted by applicable law, project maintainers, contributors, infrastructure operators and community participants are not liable for losses arising from software defects, wallet compromise, lost credentials, network interruption, inaccurate data, third-party services, smart-contract interactions or market activity.']},
  {id:'changes',title:'Changes and availability',paragraphs:['These Terms may be updated as the project evolves. Official services and network interfaces may also change, be suspended or be retired. The current version of the Terms will be published on this page.']},
  {id:'law',title:'Applicable law and user responsibility',paragraphs:['Rabbit Chain is internet-based, permissionless infrastructure used across jurisdictions. You are responsible for determining whether your access, development activity, mining, transactions or use of digital assets complies with the laws and obligations applicable to you.']},
  {id:'contact',title:'Official channels',paragraphs:['Official project information is published at rabbitchain.org, github.com/rabbitmainnet and x.com/rabbit_mainnet. Verify links before connecting a wallet or downloading software.']}
]

export default function TermsConditions(){return <LegalPage eyebrow="LEGAL · TERMS" title="Terms & Conditions" intro="Terms governing access to official Rabbit Chain websites, software information and network-facing services." sections={sections}/>}
