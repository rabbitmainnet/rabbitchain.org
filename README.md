# Rabbit Chain Official Portal — Professional Portal v1

Consolidated production portal for RabbitChain.org.

## Principles
- One coherent visual system and one imported stylesheet (`src/styles.css`).
- Rabbit Platform is a first-class product surface: Swap, Liquidity, Launchpool, Token Factory, Bridge and Portfolio.
- Wallet connection supports EIP-6963 injected wallets and WalletConnect/Reown.
- Testnet is Chain ID 9280; Mainnet is Chain ID 928.
- RPC, explorer, faucet, releases and application services are never presented as live before their readiness flags are enabled.
- No fake TVL, prices, partners, transactions or usage metrics.

## Build
```bash
npm run build
```

## Local preview
```bash
npm run dev -- --host 0.0.0.0
```

## Deploy
GitHub Actions deploys `main` to GitHub Pages. The workflow copies `dist/index.html` to `dist/404.html` for React Router fallback.
