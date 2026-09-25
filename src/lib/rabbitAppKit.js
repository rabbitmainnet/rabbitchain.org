import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { defineChain } from '@reown/appkit/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

export const RABBIT_TESTNET_CHAIN_ID = 9280
export const RABBIT_TESTNET_CHAIN_HEX = '0x2440'
export const RABBIT_TESTNET_CAIP = 'eip155:9280'

export const rabbitTestnetAppKitNetwork = defineChain({
  id: RABBIT_TESTNET_CHAIN_ID,
  caipNetworkId: RABBIT_TESTNET_CAIP,
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

//
// Igual ao projeto INRI:
//
// Estas duas redes NÃO viram redes principais da Rabbit.
// Servem para o AppKit manter compatibilidade/listagem ampla
// de wallets EVM.
//
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

const appKitNetworks = [
  rabbitTestnetAppKitNetwork,
  ethereumCompatibilityNetwork,
  polygonCompatibilityNetwork,
]

//
// Mesmos IDs priorizados no projeto INRI.
// Isso NÃO bloqueia outras wallets.
//
const featuredWalletIds = [
  // MetaMask
  'c57ca95b47569778a828d19178114f2db125b25b778adf5cba72bd778e231769',

  // Rainbow
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',

  // Trust Wallet
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
]

let appKitStarted = false
let rabbitAppKit = null

function installRabbitAppKitCss() {
  if (typeof document === 'undefined') return
  if (document.getElementById('rabbit-appkit-css')) return

  const style = document.createElement('style')

  style.id = 'rabbit-appkit-css'

  style.textContent = `
    w3m-modal {
      z-index: 2147483000 !important;
      --w3m-z-index: 2147483000;
      --w3m-accent: #7a5cff;
      --w3m-border-radius-master: 12px;
    }

    @media (max-width:680px) {
      w3m-modal {
        --w3m-z-index:2147483000;
        --w3m-accent:#7a5cff;
        --w3m-border-radius-master:10px;
      }

      body:has(w3m-modal) {
        overflow-x:hidden !important;
      }
    }
  `

  document.head.appendChild(style)
}

export function ensureRabbitAppKit() {
  if (typeof window === 'undefined') return null

  if (appKitStarted && rabbitAppKit) {
    return rabbitAppKit
  }

  installRabbitAppKitCss()

  rabbitAppKit = createAppKit({
    adapters: [
      new EthersAdapter(),
    ],

    networks: appKitNetworks,

    defaultNetwork: rabbitTestnetAppKitNetwork,

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

    featuredWalletIds,

    allWallets: 'SHOW',

    enableWallets: true,
    enableWalletGuide: true,
    enableNetworkSwitch: true,
    enableReconnect: true,
    enableMobileFullScreen: true,

    //
    // Igual à INRI: permite conectar primeiro.
    // Depois direcionamos para Rabbit Testnet.
    //
    allowUnsupportedChain: true,

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

  appKitStarted = true

  return rabbitAppKit
}

export async function openRabbitAppKit(view = 'Connect') {
  const appKit = ensureRabbitAppKit()

  if (!appKit) {
    throw new Error('Rabbit wallet connection is unavailable.')
  }

  return appKit.open({
    view,
  })
}
