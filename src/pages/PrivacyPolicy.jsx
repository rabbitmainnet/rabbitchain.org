import LegalPage from '../components/LegalPage'

const sections=[
  {id:'scope',title:'Scope',paragraphs:[
    'This Privacy Policy applies to official Rabbit Chain websites and services controlled by the Rabbit Chain project maintainers, including rabbitchain.org and official Rabbit-branded network interfaces that may be activated for Testnet or Mainnet.',
    'Rabbit Chain is designed as open, permissionless infrastructure. Independent nodes, community explorers, wallets, applications and other third-party services are outside the scope of this Policy and may have their own privacy practices.'
  ]},
  {id:'data',title:'Information we may collect',paragraphs:['The project aims to collect as little personal information as reasonably necessary to operate, secure and improve official services.'],items:[
    'Information you voluntarily provide through official support, contributor, partnership or contact channels.',
    'Basic technical information such as IP address, approximate region, browser, operating system, device type, referring page, request timing and service-performance logs.',
    'Security and operational logs related to official web, RPC, explorer, faucet or other infrastructure when those services are active.'
  ]},
  {id:'wallets',title:'Wallet connections',paragraphs:[
    'Connecting a wallet to an official Rabbit Chain interface may expose the public wallet address and current network to that interface. The website does not need your seed phrase or private key and should never ask for them.',
    'Wallet providers and browser extensions are separate products. Their own privacy policies and telemetry practices may apply.'
  ]},
  {id:'onchain',title:'Public on-chain data',paragraphs:[
    'Rabbit Chain is a public blockchain. Wallet addresses, transactions, contract calls, block data and related metadata broadcast to the network are public by design and may be indexed, copied and analyzed by anyone.',
    'Confirmed blockchain history is generally immutable. The project cannot erase or privately rewrite public on-chain records at a user request.'
  ]},
  {id:'use',title:'How information may be used',paragraphs:['Off-chain information may be used to operate and maintain official services, monitor availability and security, detect abuse, diagnose technical problems, improve the website and infrastructure, respond to requests and satisfy applicable legal obligations.']},
  {id:'cookies',title:'Cookies and analytics',paragraphs:[
    'Official Rabbit Chain services may use essential browser storage, cookies or similar technologies for security, preferences and product functionality. If analytics are enabled, the project should prefer limited, proportionate measurement and avoid collecting unnecessary personal data.',
    'Any material analytics or advertising technology added later may require an update to this Policy and, where applicable, additional consent controls.'
  ]},
  {id:'sharing',title:'Third parties and service providers',paragraphs:[
    'Official services may rely on hosting, DNS, content delivery, monitoring, source-code hosting, wallet connectivity or other infrastructure providers. Information may be processed by those providers only to the extent necessary to provide their services.',
    'Information may also be disclosed when reasonably necessary to protect users or infrastructure, investigate abuse, comply with applicable law or respond to valid legal process.'
  ]},
  {id:'security',title:'Security and retention',paragraphs:[
    'Reasonable technical and organizational measures are used for data under official project control, but no website, node, RPC endpoint or online system can be guaranteed perfectly secure.',
    'Operational logs and other off-chain data should be retained only for as long as reasonably necessary for security, debugging, analytics, infrastructure operation or legal requirements.'
  ]},
  {id:'rights',title:'Your choices and rights',paragraphs:[
    'For off-chain personal information voluntarily supplied to the project, you may request access, correction or deletion where applicable and technically possible. Rights vary by jurisdiction.',
    'These rights generally cannot be applied to immutable public blockchain data already confirmed by the network.'
  ]},
  {id:'children',title:'Children’s privacy',paragraphs:['Official Rabbit Chain services are not directed to children who are below the age required by applicable law to provide valid consent. If you believe personal information was submitted by a child through an official channel, contact the project through an official public channel for review.']},
  {id:'changes',title:'Changes to this Policy',paragraphs:['This Policy may be updated as Rabbit Chain moves from public Testnet to Mainnet, activates additional services or changes infrastructure. The effective version will be published on this page.']},
  {id:'contact',title:'Official channels',paragraphs:['Official project information is published at rabbitchain.org, github.com/rabbitmainnet and x.com/rabbit_mainnet. Privacy-related requests should use a verified official contact channel published by Rabbit Chain.']}
]

export default function PrivacyPolicy(){return <LegalPage eyebrow="LEGAL · PRIVACY" title="Privacy Policy" intro="How official Rabbit Chain web services handle off-chain information, wallet connections and public blockchain data." sections={sections}/>}
