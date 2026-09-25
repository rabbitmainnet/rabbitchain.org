import {
  NETWORK_LIST,
  WALLET_NETWORK_LIST,
} from '../config/networks'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
const RABBIT_TESTNET_CHAIN_ID = 9280

let metaMaskConnectClientPromise = null

function numericChainId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : null
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  const raw = String(value).trim()

  if (!raw) return null

  if (raw.toLowerCase().startsWith('0x')) {
    const parsed =
      Number.parseInt(raw, 16)

    return Number.isFinite(parsed)
      ? parsed
      : null
  }

  const parsed = Number(raw)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function walletUnknownChain(error) {
  const code =
    Number(
      error?.code ??
      error?.data?.originalError?.code
    )

  if (code === 4902) {
    return true
  }

  const message =
    String(
      error?.message ||
      error?.data?.message ||
      error ||
      ''
    )

  return (
    /unknown chain/i.test(message) ||
    /unrecognized chain/i.test(message) ||
    /chain.*not.*added/i.test(message) ||
    /network.*not.*added/i.test(message) ||
    /missing.*chain/i.test(message)
  )
}

function walletNetworkParams(network) {
  return {
    chainId: network.chainIdHex,
    chainName: network.name,

    nativeCurrency: {
      name:
        network.currencyName ||
        network.currency,

      symbol: network.currency,

      decimals: 18,
    },

    rpcUrls: [
      network.rpcUrl,
    ],

    blockExplorerUrls:
      network.explorerUrl
        ? [network.explorerUrl]
        : [],

    iconUrls: [
      'https://rabbitchain.org/rabbit-wallet-icon.png',
    ],
  }
}

function legacyWalletInfo(provider) {
  if (!provider) {
    return {
      name: 'Browser Wallet',
      rdns: 'legacy',
    }
  }

  //
  // Flags mais específicos primeiro.
  // Algumas wallets também expõem isMetaMask
  // por compatibilidade.
  //
  if (provider.isRabby) {
    return {
      name: 'Rabby Wallet',
      rdns: 'io.rabby',
    }
  }

  if (
    provider.isCoinbaseWallet ||
    provider.isCoinbaseBrowser
  ) {
    return {
      name: 'Coinbase Wallet',
      rdns: 'com.coinbase.wallet',
    }
  }

  if (
    provider.isTrust ||
    provider.isTrustWallet
  ) {
    return {
      name: 'Trust Wallet',
      rdns: 'com.trustwallet.app',
    }
  }

  if (provider.isBraveWallet) {
    return {
      name: 'Brave Wallet',
      rdns: 'com.brave.wallet',
    }
  }

  if (provider.isMetaMask) {
    return {
      name: 'MetaMask',
      rdns: 'io.metamask',
    }
  }

  return {
    name: 'Browser Wallet',
    rdns: 'legacy',
  }
}

export function detectInjectedWallets(
  timeout = 450
) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([])
      return
    }

    const wallets = []

    const seenProviders =
      new WeakSet()

    const seenKeys =
      new Set()

    function addWallet({
      provider,
      name,
      icon = null,
      rdns = '',
      uuid = '',
    }) {
      if (
        !provider ||
        typeof provider.request !== 'function'
      ) {
        return
      }

      if (seenProviders.has(provider)) {
        return
      }

      const normalizedRdns =
        String(rdns || '')
          .trim()
          .toLowerCase()

      const normalizedName =
        String(name || 'Browser Wallet')
          .trim()
          .toLowerCase()

      //
      // Não mostrar duas MetaMasks / duas Rabbys
      // anunciadas pela mesma extensão.
      //
      const identity =
        normalizedRdns &&
        normalizedRdns !== 'legacy'
          ? `rdns:${normalizedRdns}`
          : `name:${normalizedName}`

      if (
        identity &&
        seenKeys.has(identity)
      ) {
        return
      }

      seenProviders.add(provider)

      if (identity) {
        seenKeys.add(identity)
      }

      wallets.push({
        kind: 'injected',

        name:
          name ||
          'Browser Wallet',

        icon,

        provider,

        rdns:
          rdns ||
          '',

        uuid:
          uuid ||
          '',
      })
    }

    function onAnnouncement(event) {
      const detail =
        event?.detail

      if (!detail?.provider) {
        return
      }

      addWallet({
        provider:
          detail.provider,

        name:
          detail.info?.name ||
          'Browser Wallet',

        icon:
          detail.info?.icon ||
          null,

        rdns:
          detail.info?.rdns ||
          '',

        uuid:
          detail.info?.uuid ||
          '',
      })
    }

    window.addEventListener(
      'eip6963:announceProvider',
      onAnnouncement
    )

    try {
      window.dispatchEvent(
        new Event(
          'eip6963:requestProvider'
        )
      )
    } catch {}

    window.setTimeout(() => {
      window.removeEventListener(
        'eip6963:announceProvider',
        onAnnouncement
      )

      //
      // Fallback para navegadores/wallets
      // que ainda não anunciam EIP-6963.
      //
      const legacyProviders =
        Array.isArray(
          window.ethereum?.providers
        )
          ? window.ethereum.providers
          : window.ethereum
            ? [window.ethereum]
            : []

      for (
        const provider
        of legacyProviders
      ) {
        const info =
          legacyWalletInfo(provider)

        addWallet({
          provider,

          name:
            info.name,

          icon:
            null,

          rdns:
            info.rdns,
        })
      }

      resolve(wallets)
    }, timeout)
  })
}

async function getMetaMaskConnectClient() {
  if (!metaMaskConnectClientPromise) {
    metaMaskConnectClientPromise =
      import('@metamask/connect-evm')
        .then(
          async ({
            createEVMClient,
          }) =>
            createEVMClient({
              dapp: {
                name:
                  'Rabbit Chain',

                url:
                  'https://rabbitchain.org',
              },

              api: {
                supportedNetworks:
                  Object.fromEntries(
                    WALLET_NETWORK_LIST
                      .filter(
                        (network) =>
                          network.chainIdHex &&
                          network.rpcUrl
                      )
                      .map(
                        (network) => [
                          network.chainIdHex,
                          network.rpcUrl,
                        ]
                      )
                  ),
              },
            })
        )
  }

  return metaMaskConnectClientPromise
}

export async function connectMetaMaskConnect() {
  const network =
    WALLET_NETWORK_LIST.find(
      (item) =>
        Number(item.chainId) ===
        RABBIT_TESTNET_CHAIN_ID
    )

  if (!network) {
    throw new Error(
      'Rabbit Testnet configuration is unavailable.'
    )
  }

  const client =
    await getMetaMaskConnectClient()

  await client.connect({
    chainIds: [
      network.chainIdHex,
    ],
  })

  const provider =
    client.getProvider()

  if (!provider?.request) {
    throw new Error(
      'MetaMask Connect did not return an EIP-1193 provider.'
    )
  }

  let currentChain = null

  try {
    currentChain =
      await provider.request({
        method: 'eth_chainId',
      })
  } catch {}

  if (
    numericChainId(currentChain) !==
    Number(network.chainId)
  ) {
    try {
      await provider.request({
        method:
          'wallet_switchEthereumChain',

        params: [
          {
            chainId:
              network.chainIdHex,
          },
        ],
      })
    } catch (error) {
      if (!walletUnknownChain(error)) {
        throw error
      }

      await provider.request({
        method:
          'wallet_addEthereumChain',

        params: [
          walletNetworkParams(network),
        ],
      })

      await provider.request({
        method:
          'wallet_switchEthereumChain',

        params: [
          {
            chainId:
              network.chainIdHex,
          },
        ],
      })
    }
  }

  return {
    kind:
      'metamask-connect',

    name:
      'MetaMask',

    icon:
      null,

    provider,

    rdns:
      'io.metamask',
  }
}

export function saveWalletPreference(
  wallet
) {
  try {
    localStorage.setItem(
      LAST_WALLET_KEY,

      JSON.stringify({
        kind:
          wallet.kind ||
          'injected',

        rdns:
          wallet.rdns ||
          '',

        name:
          wallet.name ||
          '',
      })
    )
  } catch {}
}

export function getWalletPreference() {
  try {
    return JSON.parse(
      localStorage.getItem(
        LAST_WALLET_KEY
      ) || 'null'
    )
  } catch {
    return null
  }
}

export function clearWalletPreference() {
  try {
    localStorage.removeItem(
      LAST_WALLET_KEY
    )
  } catch {}
}

export async function connectWallet(
  provider
) {
  if (!provider?.request) {
    throw new Error(
      'Wallet provider is unavailable.'
    )
  }

  const accounts =
    await provider.request({
      method:
        'eth_requestAccounts',
    })

  const chainIdHex =
    await provider.request({
      method:
        'eth_chainId',
    })

  return {
    account:
      accounts?.[0] ||
      null,

    chainIdHex,

    chainId:
      numericChainId(
        chainIdHex
      ),
  }
}

export async function getWalletSnapshot(
  provider
) {
  if (!provider?.request) {
    return {
      account: null,
      chainIdHex: null,
      chainId: null,
    }
  }

  const [
    accounts,
    chainIdHex,
  ] = await Promise.all([
    provider.request({
      method:
        'eth_accounts',
    }),

    provider.request({
      method:
        'eth_chainId',
    }),
  ])

  return {
    account:
      accounts?.[0] ||
      null,

    chainIdHex,

    chainId:
      numericChainId(
        chainIdHex
      ),
  }
}

export async function switchOrAddNetwork(
  provider,
  network
) {
  if (!provider?.request) {
    throw new Error(
      'Wallet provider is unavailable.'
    )
  }

  try {
    await provider.request({
      method:
        'wallet_switchEthereumChain',

      params: [
        {
          chainId:
            network.chainIdHex,
        },
      ],
    })

    return
  } catch (error) {
    if (!walletUnknownChain(error)) {
      throw error
    }
  }

  await provider.request({
    method:
      'wallet_addEthereumChain',

    params: [
      walletNetworkParams(
        network
      ),
    ],
  })

  //
  // Algumas wallets mudam automaticamente;
  // outras exigem o switch explícito.
  //
  try {
    await provider.request({
      method:
        'wallet_switchEthereumChain',

      params: [
        {
          chainId:
            network.chainIdHex,
        },
      ],
    })
  } catch (error) {
    const chainIdHex =
      await provider.request({
        method:
          'eth_chainId',
      })

    if (
      numericChainId(chainIdHex) !==
      Number(network.chainId)
    ) {
      throw error
    }
  }
}

export function friendlyWalletError(
  error,
  fallback = 'Wallet request failed'
) {
  const code =
    Number(
      error?.code ??
      error?.data?.originalError?.code
    )

  const message =
    String(
      error?.message ||
      error?.data?.message ||
      error ||
      ''
    ).trim()

  if (
    code === 4001 ||
    /user rejected/i.test(message) ||
    /user denied/i.test(message) ||
    /request rejected/i.test(message)
  ) {
    return 'Wallet request cancelled.'
  }

  if (
    code === -32002 ||
    /already pending/i.test(message) ||
    /request.*pending/i.test(message)
  ) {
    return 'A wallet request is already waiting for approval.'
  }

  if (
    /failed to connect/i.test(message) ||
    /connection.*failed/i.test(message)
  ) {
    return 'Could not connect to the wallet. Please try again.'
  }

  if (
    /unsupported method/i.test(message) ||
    /method.*not supported/i.test(message)
  ) {
    return 'This wallet does not support that request.'
  }

  return (
    message ||
    fallback
  )
}

export function identifyRabbitNetwork(
  chainId
) {
  const id =
    numericChainId(chainId)

  if (!id) return null

  return (
    NETWORK_LIST.find(
      (network) =>
        Number(network.chainId) === id
    ) ||
    WALLET_NETWORK_LIST.find(
      (network) =>
        Number(network.chainId) === id
    ) ||
    null
  )
}

export function shortAddress(
  address
) {
  if (!address) {
    return ''
  }

  const value =
    String(address)

  if (value.length <= 12) {
    return value
  }

  return (
    `${value.slice(0, 6)}` +
    `…` +
    `${value.slice(-4)}`
  )
}
