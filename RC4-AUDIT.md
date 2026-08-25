# RabbitChain.org RC4 audit

This revision focuses on launch-readiness without changing protocol claims or enabling services that remain pre-launch.

## Implemented
- WalletConnect/Reown remote wallet path using the project configuration for `rabbitchain.org`.
- Existing EIP-6963 injected-wallet support retained.
- Wallet session restoration across refreshes for injected wallets and WalletConnect sessions when available.
- Better disconnect handling and wallet error messages.
- Add/switch Rabbit network flow retained through EIP-1193.
- Mobile navigation backdrop, scroll locking, touch targets, safe-area support and small-screen polish.
- Wallet modal redesigned for installed + QR/mobile choices.
- Route hash scrolling fixed for links such as LCQ Architecture, Reward Model, network parameters and JSON-RPC.
- Dynamic title, description, OpenGraph, Twitter and canonical metadata.
- Absolute social image URLs and PWA manifest cleanup.
- Accessibility improvements: skip link, focus visibility, dialog metadata, ARIA state, live toast status.
- Additional readability pass over very small labels and controls.
- GitHub Pages build remains compatible with SPA fallback.

## Intentionally unchanged
- RPC / explorer / faucet readiness flags remain false until those public services are intentionally opened.
- Mainnet remains after Testnet.
- Whitepaper and release download buttons remain gated until official artifacts exist.
- Platform modules remain preview/roadmap unless backed by deployed contracts.

## Before pushing RC4
Run `npm install` once locally. This installs `@walletconnect/ethereum-provider` and synchronizes `package-lock.json`, then run `npm run build`.
