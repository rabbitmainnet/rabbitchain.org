const META = {
  '/': ['Rabbit Chain — LCQ Layer 1', 'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. One wallet. One fair chance.'],
  '/testnet': ['Rabbit Testnet — Chain ID 9280', 'Connect a wallet, add Rabbit Testnet and follow the official public launch path.'],
  '/mainnet': ['Rabbit Mainnet — Chain ID 928', 'Rabbit Mainnet is the production network planned after public Testnet validation.'],
  '/lcq': ['LCQ Consensus — Rabbit Chain', 'Work, eligibility, live queue, producer opportunity and committee participation on Rabbit Chain.'],
  '/mining': ['Mining — Rabbit Chain', 'Download Rabbit Core V2.4.25 for Rabbit Testnet. Automatic verified blockchain bootstrap, encrypted wallet setup, verified packages and safe upgrades preserving your existing wallet and blockchain data. Includes synchronization recovery improvements and preserves the historical activation schedule.'],
  '/nodes': ['Run a Node — Rabbit Chain', 'Operate independent Rabbit P2P and RPC infrastructure.'],
  '/developers': ['Developers — Rabbit Chain', 'Rabbit EVM, JSON-RPC, wallet and developer integration resources.'],
  '/docs': ['Documentation — Rabbit Chain', 'Official Rabbit Chain protocol and network documentation.'],
  '/platform': ['Rabbit Platform', 'Official wallet-connected application layer for Rabbit Chain.'],
  '/vrf': ['Rabbit VRF — Verifiable Randomness', 'Rabbit VRF is the native verifiable randomness protocol for Rabbit Chain. Test the live public Testnet coordinator and inspect canonical VRF requests.'],
  '/rab': ['RAB — Rabbit Chain Native Asset', 'Rabbit Testnet uses tRAB; the future Rabbit Mainnet will use RAB.'],
  '/security': ['Security — Rabbit Chain', 'Official Rabbit Chain domain, wallet and release verification guidance.'],
  '/releases': ['Releases — Rabbit Chain', 'Official Rabbit Core V2.4.25 with automatic bootstrap, verified downloads, SHA-256 hashes and safe upgrade instructions. Includes synchronization recovery improvements and preserves the historical activation schedule.'],
  '/about': ['About Rabbit Chain', 'Rabbit Chain project principles, architecture and public launch model.'],
  '/whitepaper': ['Whitepaper — Rabbit Chain', 'Read the historical Whitepaper v1.7 and the Rabbit Core V2.4.25 technical addendum.'],
  '/community': ['Community — Rabbit Chain', 'Official Rabbit Chain GitHub, X, Discord, Instagram, Facebook and community resources.'],
  '/status': ['Network Status — Rabbit Chain', 'Official Rabbit Testnet RPC, WebSocket, explorer, downloads and planned-service status.'],
  '/privacy-policy': ['Privacy Policy — Rabbit Chain', 'Rabbit Chain privacy policy.'],
  '/terms-and-conditions': ['Terms & Conditions — Rabbit Chain', 'Rabbit Chain terms and conditions.'],
  '/risk-disclosure': ['Risk Disclosure — Rabbit Chain', 'Rabbit Chain network, software and digital-asset risk disclosures.'],
}

export function metaFor(pathname) {
  pathname = pathname.replace(/\/$/, '') || '/'
  if (pathname.startsWith('/platform/')) return ['Rabbit Platform — Rabbit Chain', 'Wallet-connected Rabbit Platform module. Service availability is shown explicitly.']
  return META[pathname] || ['Rabbit Chain', 'Rabbit Chain official network portal.']
}

export function canonicalFor(pathname) {
  return `https://rabbitchain.org${pathname.replace(/\/$/, '')}/`
}
