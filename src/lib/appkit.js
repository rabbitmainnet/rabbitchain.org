// RABBIT_APPKIT_WALLET_LAYER_V12
import { createAppKit } from '@reown/appkit/react'
import { defineChain } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'viem'

import { WALLET_NETWORK_LIST } from '../config/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

function toAppKitNetwork(network) {
  const id = Number(network.chainId)
  const rpcUrl = String(network.rpcUrl || '')
  const explorerUrl = String(network.explorerUrl || '')

  return defineChain({
    id,
    caipNetworkId: `eip155:${id}`,
    chainNamespace: 'eip155',
    name: network.name,
    nativeCurrency: {
      decimals: 18,
      name: network.currencyName || network.currency,
      symbol: network.currency,
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
    blockExplorers: explorerUrl ? {
      default: { name: 'Rabbit Explorer', url: explorerUrl },
    } : undefined,
    testnet: id === 9280,
  })
}

export const RABBIT_APPKIT_NETWORKS = WALLET_NETWORK_LIST
  .filter((network) => Number(network.chainId) > 0 && network.rpcUrl)
  .map(toAppKitNetwork)

export const RABBIT_APPKIT_TESTNET =
  RABBIT_APPKIT_NETWORKS.find((network) => Number(network.id) === 9280)

if (!RABBIT_APPKIT_TESTNET) {
  throw new Error('Rabbit Testnet 9280 is missing from AppKit configuration.')
}

// RABBIT_APPKIT_EXPLORER_SEMANTICS_V14B
const rabbitTransports = Object.fromEntries(
  RABBIT_APPKIT_NETWORKS.map((network) => [
    Number(network.id),
    http(network.rpcUrls.default.http[0]),
  ]),
)

export const rabbitWagmiAdapter = new WagmiAdapter({
  networks: RABBIT_APPKIT_NETWORKS,
  projectId: REOWN_PROJECT_ID,
  ssr: false,
  multiInjectedProviderDiscovery: true,
  syncConnectedChain: false,
  transports: rabbitTransports,
})

export const rabbitAppKit = createAppKit({
  adapters: [rabbitWagmiAdapter],
  networks: RABBIT_APPKIT_NETWORKS,
  projectId: REOWN_PROJECT_ID,
  metadata: WALLETCONNECT_METADATA,

  enableWallets: true,
  enableNetworkSwitch: true,
  enableReconnect: true,
  enableMobileFullScreen: true,
  allWallets: 'SHOW',
  featuredWalletIds: [],
  allowUnsupportedChain: true,
  defaultAccountTypes: { eip155: 'eoa' },

  features: {
    analytics: false,
    email: false,
    socials: [],
    onramp: false,
    swaps: false,
  },
})

export function getRabbitAppKitNetwork(chainId) {
  const target = Number(chainId)
  return RABBIT_APPKIT_NETWORKS.find((network) => Number(network.id) === target) || null
}

export async function disconnectRabbitAppKit() {
  await rabbitAppKit.adapter?.connectionControllerClient?.disconnect?.()
}
