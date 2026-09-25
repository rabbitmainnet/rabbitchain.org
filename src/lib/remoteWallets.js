import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { defineChain } from '@reown/appkit/networks'

import {
  REOWN_PROJECT_ID,
  WALLETCONNECT_METADATA,
} from '../config/walletconnect'

export const RABBIT_REMOTE_CHAIN_ID = 9280
export const RABBIT_REMOTE_CHAIN_HEX = '0x2440'
export const RABBIT_REMOTE_CAIP = 'eip155:9280'

export const rabbitRemoteNetwork = defineChain({
  id: RABBIT_REMOTE_CHAIN_ID,
  caipNetworkId: RABBIT_REMOTE_CAIP,
  chainNamespace: 'eip155',

  name: 'Rabbit Testnet',

  nativeCurrency: {
    decimals: 18,
    name: 'Test RAB',
    symbol: 'tRAB',
  },

  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.rabbitchain.org'],
    },
    public: {
      http: ['https://rpc-testnet.rabbitchain.org'],
    },
  },

  blockExplorers: {
    default: {
      name: 'Rabbit Explorer',
      url: 'https://explorer-testnet.rabbitchain.org',
    },
  },
})

const ethereumCompatibilityNetwork = defineChain({
  id: 1,
  caipNetworkId: 'eip155:1',
  chainNamespace: 'eip155',

  name: 'Ethereum',

  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },

  rpcUrls: {
    default: {
      http: ['https://ethereum-rpc.publicnode.com'],
    },
    public: {
      http: ['https://ethereum-rpc.publicnode.com'],
    },
  },

  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
})

const polygonCompatibilityNetwork = defineChain({
  id: 137,
  caipNetworkId: 'eip155:137',
  chainNamespace: 'eip155',

  name: 'Polygon',

  nativeCurrency: {
    decimals: 18,
    name: 'POL',
    symbol: 'POL',
  },

  rpcUrls: {
    default: {
      http: ['https://polygon-rpc.com'],
    },
    public: {
      http: ['https://polygon-rpc.com'],
    },
  },

  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
  },
})

//
// Reown WalletGuide IDs
//
const METAMASK_WALLET_ID =
  'c57ca95b47569778a828d19178114f2db125b25b778adf5cba72bd778e231769'

const RAINBOW_WALLET_ID =
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369'

const TRUST_WALLET_ID =
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'

let remoteAppKit = null

function installRemoteWalletCss() {
  if (typeof document === 'undefined') return

  if (document.getElementById('rabbit-remote-wallet-css')) {
    return
  }

  const style = document.createElement('style')

  style.id = 'rabbit-remote-wallet-css'

  style.textContent = `
    w3m-modal {
      z-index: 2147483000 !important;
      --w3m-z-index: 2147483000;
      --w3m-accent: #7a5cff;
      --w3m-border-radius-master: 12px;
    }
  `

  document.head.appendChild(style)
}

export function ensureRabbitRemoteWallets() {
  if (typeof window === 'undefined') return null

  if (remoteAppKit) return remoteAppKit

  installRemoteWalletCss()

  remoteAppKit = createAppKit({
    adapters: [
      new EthersAdapter(),
    ],

    networks: [
      rabbitRemoteNetwork,
      ethereumCompatibilityNetwork,
      polygonCompatibilityNetwork,
    ],

    defaultNetwork: rabbitRemoteNetwork,

    defaultAccountTypes: {
      eip155: 'eoa',
    },

    projectId: REOWN_PROJECT_ID,

    metadata: WALLETCONNECT_METADATA,

    customRpcUrls: {
      'eip155:9280': [
        {
          url: 'https://rpc-testnet.rabbitchain.org',
        },
      ],

      'eip155:1': [
        {
          url: 'https://ethereum-rpc.publicnode.com',
        },
      ],

      'eip155:137': [
        {
          url: 'https://polygon-rpc.com',
        },
      ],
    },

    chainImages: {
      9280: 'https://rabbitchain.org/rabbit-wallet-icon.png',
    },

    themeMode: 'light',

    themeVariables: {
      '--w3m-accent': '#7a5cff',
      '--w3m-border-radius-master': '12px',
    },

    //
    // MetaMask NÃO passa pelo WalletConnect/Reown.
    // Ela usa MetaMask Connect oficial da Rabbit.
    //
    excludeWalletIds: [
      METAMASK_WALLET_ID,
    ],

    featuredWalletIds: [
      TRUST_WALLET_ID,
      RAINBOW_WALLET_ID,
    ],

    allWallets: 'SHOW',

    enableWallets: true,
    enableWalletGuide: true,
    enableNetworkSwitch: true,

    //
    // Evita sessão fantasma interferindo no MetaMask Connect.
    //
    enableReconnect: false,

    enableMobileFullScreen: true,

    allowUnsupportedChain: true,

    //
    // Reown 1.8.23+ corrige persistência de universal links
    // quando esta opção está habilitada.
    //
    experimental_preferUniversalLinks: true,

    enableCoinbase: true,
    coinbasePreference: 'eoaOnly',

    features: {
      analytics: true,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,

      connectMethodsOrder: [
        'wallet',
      ],
    },
  })

  return remoteAppKit
}

export async function openRabbitRemoteWallets() {
  const appKit = ensureRabbitRemoteWallets()

  if (!appKit) {
    throw new Error('Remote wallet connection is unavailable.')
  }

  return appKit.open({
    view: 'Connect',
  })
}

export async function disconnectRabbitRemoteWallets() {
  const appKit = ensureRabbitRemoteWallets()

  if (!appKit) return

  try {
    await appKit.disconnect()
  } catch {}

  try {
    await appKit.close()
  } catch {}
}

export function isRabbitWalletConnectProvider(provider) {
  return Boolean(
    provider?.session?.topic &&
    (
      provider?.client?.request ||
      provider?.signer?.client?.request
    )
  )
}

export function walletConnectSessionHasRabbit(provider) {
  const session = provider?.session

  if (!session) return true

  const namespaces = Object.values(
    session.namespaces || {}
  )

  for (const namespace of namespaces) {
    const chains = Array.isArray(namespace?.chains)
      ? namespace.chains
      : []

    if (chains.includes(RABBIT_REMOTE_CAIP)) {
      return true
    }

    const accounts = Array.isArray(namespace?.accounts)
      ? namespace.accounts
      : []

    if (
      accounts.some((account) =>
        String(account).startsWith(
          `${RABBIT_REMOTE_CAIP}:`
        )
      )
    ) {
      return true
    }
  }

  return false
}

export function rabbitRouteProvider(provider) {
  if (!provider) return provider

  if (!isRabbitWalletConnectProvider(provider)) {
    return provider
  }

  const client =
    provider.client ||
    provider.signer?.client

  const topic =
    provider.session?.topic

  const request = async ({
    method,
    params,
  }) => {
    try {
      await provider.setDefaultChain?.(
        RABBIT_REMOTE_CAIP
      )
    } catch {
      try {
        await provider.setDefaultChain?.(
          RABBIT_REMOTE_CHAIN_ID
        )
      } catch {}
    }

    //
    // Mesmo princípio usado pela INRI:
    // envia diretamente ao topic correto + CAIP correto.
    //
    if (client?.request && topic) {
      return client.request({
        topic,

        chainId: RABBIT_REMOTE_CAIP,

        request: {
          method,

          ...(params !== undefined
            ? { params }
            : {}),
        },
      })
    }

    try {
      return await provider.request(
        {
          method,
          ...(params !== undefined
            ? { params }
            : {}),
        },

        RABBIT_REMOTE_CAIP
      )
    } catch {
      return provider.request({
        method,

        ...(params !== undefined
          ? { params }
          : {}),

        chainId: RABBIT_REMOTE_CAIP,
      })
    }
  }

  return new Proxy(provider, {
    get(target, prop) {
      if (prop === 'request') {
        return request
      }

      const value =
        Reflect.get(target, prop, target)

      return typeof value === 'function'
        ? value.bind(target)
        : value
    },
  })
}
