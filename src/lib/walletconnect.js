import {
  REOWN_PROJECT_ID,
  WALLETCONNECT_METADATA,
} from '../config/walletconnect'

import {
  WALLET_NETWORK_LIST,
} from '../config/networks'

const RABBIT_CHAIN_ID = 9280
const RABBIT_CHAIN_HEX = '0x2440'
const RABBIT_CAIP = 'eip155:9280'

let providerPromise = null
let walletExplorerPromise = null
let walletExplorer = null

async function ensureWalletExplorer(provider) {
  if (walletExplorer) {
    return walletExplorer
  }

  if (!walletExplorerPromise) {
    walletExplorerPromise = (async () => {
      const [
        appKitModule,
        networkModule,
      ] = await Promise.all([
        import('@reown/appkit/react'),
        import('@reown/appkit/networks'),
      ])

      const {
        createAppKit,
      } = appKitModule

      const {
        defineChain,
      } = networkModule

      const network =
        rabbitNetwork()

      if (!network) {
        throw new Error(
          'Rabbit Testnet configuration is unavailable.'
        )
      }

      const rabbit =
        defineChain({
          id: RABBIT_CHAIN_ID,

          caipNetworkId:
            RABBIT_CAIP,

          chainNamespace:
            'eip155',

          name:
            network.name,

          nativeCurrency: {
            name:
              network.currencyName ||
              network.currency,

            symbol:
              network.currency,

            decimals: 18,
          },

          rpcUrls: {
            default: {
              http: [
                network.rpcUrl,
              ],
            },

            public: {
              http: [
                network.rpcUrl,
              ],
            },
          },

          blockExplorers:
            network.explorerUrl
              ? {
                  default: {
                    name:
                      'Rabbit Explorer',

                    url:
                      network.explorerUrl,
                  },
                }
              : undefined,
        })

      walletExplorer =
        createAppKit({
          projectId:
            REOWN_PROJECT_ID,

          metadata:
            WALLETCONNECT_METADATA,

          networks: [
            rabbit,
          ],

          defaultNetwork:
            rabbit,

          universalProvider:
            provider.signer,

          manualWCControl:
            true,

          allWallets:
            'SHOW',

          enableWallets:
            true,

          enableWalletGuide:
            true,

          enableMobileFullScreen:
            true,

          themeMode:
            'light',

          features: {
            analytics:
              false,

            email:
              false,

            socials:
              false,

            swaps:
              false,

            onramp:
              false,

            connectMethodsOrder: [
              'wallet',
            ],
          },
        })

      return walletExplorer
    })()
  }

  return walletExplorerPromise
}

export async function openWalletConnectExplorer() {
  const provider =
    await getProvider()

  const explorer =
    await ensureWalletExplorer(provider)

  await explorer.open()
}


function rabbitNetwork() {
  return WALLET_NETWORK_LIST.find(
    (network) =>
      Number(network.chainId) ===
      RABBIT_CHAIN_ID
  )
}

function sessionHasRabbit(session) {
  if (!session) return false

  for (
    const namespace
    of Object.values(
      session.namespaces || {}
    )
  ) {
    const chains =
      Array.isArray(namespace?.chains)
        ? namespace.chains
        : []

    if (chains.includes(RABBIT_CAIP)) {
      return true
    }

    const accounts =
      Array.isArray(namespace?.accounts)
        ? namespace.accounts
        : []

    if (
      accounts.some((account) =>
        String(account).startsWith(
          `${RABBIT_CAIP}:`
        )
      )
    ) {
      return true
    }
  }

  return false
}

function rabbitAccount(provider) {
  if (provider?.accounts?.[0]) {
    return provider.accounts[0]
  }

  for (
    const namespace
    of Object.values(
      provider?.session?.namespaces || {}
    )
  ) {
    const accounts =
      Array.isArray(namespace?.accounts)
        ? namespace.accounts
        : []

    for (const account of accounts) {
      const value = String(account)

      if (
        value.startsWith(
          `${RABBIT_CAIP}:`
        )
      ) {
        return value
          .split(':')
          .slice(2)
          .join(':')
      }
    }
  }

  return null
}

async function createProvider() {
  const network = rabbitNetwork()

  if (!network?.rpcUrl) {
    throw new Error(
      'Rabbit Testnet RPC configuration is unavailable.'
    )
  }

  const {
    EthereumProvider,
  } = await import(
    '@walletconnect/ethereum-provider'
  )

  return EthereumProvider.init({
    projectId:
      REOWN_PROJECT_ID,

    metadata:
      WALLETCONNECT_METADATA,

    chains: [
      RABBIT_CHAIN_ID,
    ],

    rpcMap: {
      [RABBIT_CHAIN_ID]:
        network.rpcUrl,
    },

    //
    // IMPORTANTE:
    // Reown NÃO desenha mais nosso QR.
    //
    showQrModal: false,

    optionalMethods: [
      'eth_accounts',
      'eth_requestAccounts',
      'eth_chainId',
      'eth_call',
      'eth_getBalance',
      'eth_getTransactionReceipt',
      'eth_sign',
      'eth_signTypedData',
      'eth_signTypedData_v3',
      'eth_signTypedData_v4',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain',
      'wallet_watchAsset',
    ],

    optionalEvents: [
      'accountsChanged',
      'chainChanged',
    ],

    customStoragePrefix:
      'rabbit-wc-9280-clean-v2',
  })
}

async function getProvider() {
  if (!providerPromise) {
    providerPromise =
      createProvider()
  }

  return providerPromise
}

export async function connectWalletConnect(
  onUri
) {
  const provider =
    await getProvider()

  //
  // O explorer oficial fica preparado mas fechado.
  // Ele usa exatamente o mesmo UniversalProvider.
  //
  try {
    await ensureWalletExplorer(provider)
  } catch {}

  if (
    provider.session &&
    !sessionHasRabbit(provider.session)
  ) {
    try {
      await provider.disconnect()
    } catch {}

    providerPromise = null

    return connectWalletConnect(onUri)
  }

  const handleUri = (uri) => {
    if (
      typeof onUri === 'function' &&
      uri
    ) {
      onUri(uri)
    }
  }

  provider.on?.(
    'display_uri',
    handleUri
  )

  try {
    if (!provider.session) {
      await provider.connect()
    }
  } finally {
    provider.removeListener?.(
      'display_uri',
      handleUri
    )
  }

  if (
    !provider.session ||
    !sessionHasRabbit(provider.session)
  ) {
    throw new Error(
      'This wallet did not authorize Rabbit Testnet.'
    )
  }

  const network =
    rabbitNetwork()

  try {
    provider.signer?.setDefaultChain?.(
      RABBIT_CAIP,
      network.rpcUrl
    )
  } catch {}

  try {
    provider.chainId =
      RABBIT_CHAIN_ID
  } catch {}

  provider.__rabbitWalletConnect =
    true

  try {
    await walletExplorer?.close?.()
  } catch {}

  const account =
    rabbitAccount(provider)

  if (!account) {
    throw new Error(
      'Wallet connected without a Rabbit account.'
    )
  }

  return {
    kind: 'walletconnect',

    name:
      provider.session?.peer?.metadata?.name ||
      'WalletConnect',

    icon:
      provider.session?.peer?.metadata?.icons?.[0] ||
      null,

    rdns:
      'walletconnect',

    provider,

    state: {
      account,
      chainId:
        RABBIT_CHAIN_ID,
      chainIdHex:
        RABBIT_CHAIN_HEX,
    },
  }
}
