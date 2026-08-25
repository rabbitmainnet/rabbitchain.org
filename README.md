# Rabbit Chain Official Web Portal — V9.2

Official multi-page portal for Rabbit Chain. The brand stays above the individual networks: Rabbit Testnet (Chain ID 9280) is the first public network, and Rabbit Mainnet (Chain ID 928) follows public validation.

## Portal structure

- Home — brand, protocol, quick paths, network evolution and official resources
- Rabbit Platform — Swap, Liquidity, Launchpool, Token Factory, Bridge and wallet surface
- Rabbit Testnet — Chain ID 9280 network hub
- Rabbit Mainnet — Chain ID 928 production-network path
- LCQ Consensus — protocol architecture and reward model
- Mining — Rabbit client and participation path
- Nodes — independent infrastructure
- Developers — EVM, JSON-RPC and network configuration
- Docs — technical documentation surface
- Whitepaper — official reserved publication route
- Community — GitHub, X and security guidance
- Wallet integration — EIP-6963 injected-wallet discovery and connection
- Search palette — Ctrl/Cmd + K

## Local development

```bash
npm install
npm run build
npm run dev -- --host 0.0.0.0
```

## Network safety

Network services must only be shown as available when their configured readiness flags and endpoints are actually enabled. Do not display fake live metrics or fake service availability.

## Official links

- Website: https://rabbitchain.org
- GitHub: https://github.com/rabbitmainnet
- X: https://x.com/rabbit_mainnet

## Launch deployment

The production build is generated with:

```bash
npm install
npm run build
```

Deploy the `dist/` directory. For Hostinger/Apache, `public/.htaccess` is included so React Router URLs such as `/testnet`, `/lcq`, `/platform`, `/whitepaper`, and `/status` resolve through `index.html`.

Before public Testnet launch, enable only services that are genuinely online in `src/config/networks.js`. Do not mark RPC, Explorer, or Faucet as ready until the public endpoints have passed launch checks.

## RC2 launch polish

- Privacy Policy, Terms & Conditions and Risk Disclosure routes
- Updated official favicon/app icons
- Dedicated Rabbit network/wallet icon
- Back-to-top control
- Legal sitemap and footer links
