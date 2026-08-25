# Rabbit Chain Official Web Portal — V9

A multi-page public portal for Rabbit Chain, built around a **Testnet-first launch path** and a **Mainnet-after-validation** roadmap.

## Included

- Home portal
- Rabbit Testnet hub — Chain ID 9280
- Rabbit Mainnet roadmap — Chain ID 928
- LCQ Consensus explainer
- Mining portal
- Node operator portal
- Developer portal
- Documentation surface
- Community / official channel page
- EIP-6963 injected wallet connection
- Search / command palette (`Ctrl/Cmd + K`)
- Official Rabbit favicon and social preview assets
- Responsive desktop / tablet / mobile layout

## Network safety

The RPC, Explorer and Faucet domains are configured as reserved endpoints but stay disabled while the corresponding `public*Ready` flags are `false` in `src/config/networks.js`.

## Local development

```bash
npm install
npm run build
npm run dev -- --host 0.0.0.0
```

## Launch hierarchy

1. Rabbit Testnet — first public launch, Chain ID 9280
2. Public validation and hardening
3. Rabbit Mainnet — production network, Chain ID 928

## Official project links

- Website: RabbitChain.org
- GitHub: https://github.com/rabbitmainnet
- X: https://x.com/rabbit_mainnet
