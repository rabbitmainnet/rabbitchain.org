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

    if (
      chains.includes(
        RABBIT_CAIP
      )
    ) {
      return true
    }

    const accounts =
      Array.isArray(namespace?.accounts)
        ? namespace.accounts
        : []

    if (
      accounts.some(
        (account) =>
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
      const value =
        String(account)

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
  const network =
    rabbitNetwork()

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

    //
    // Rabbit Testnet é a rede da sessão.
    //
    chains: [
      RABBIT_CHAIN_ID,
    ],

    rpcMap: {
      [RABBIT_CHAIN_ID]:
        network.rpcUrl,
    },

    //
    // UM ÚNICO MODAL:
    // WalletConnect/Reown cuida do QR,
    // busca e seleção das wallets.
    //
    showQrModal: true,

    qrModalOptions: {
      themeMode:
        'light',

      enableExplorer:
        true,

      enableMobileFullScreen:
        true,
    },

    optionalMethods: [
      'eth_accounts',
      'eth_requestAccounts',
      'eth_chainId',
      'eth_call',
      'eth_getBalance',
      'eth_getTransactionReceipt',

      'eth_sign',
      'personal_sign',

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

    //
    // Namespace novo para não reaproveitar
    // sessões das tentativas anteriores.
    //
    customStoragePrefix:
      'rabbit-wc-9280-official-v1',
  })
}

async function getProvider() {
  if (!providerPromise) {
    providerPromise =
      createProvider()
  }

  return providerPromise
}

export async function connectWalletConnect() {
  let provider =
    await getProvider()

  //
  // Nunca aproveita sessão inválida
  // de outra chain.
  //
  if (
    provider.session &&
    !sessionHasRabbit(
      provider.session
    )
  ) {
    try {
      await provider.disconnect()
    } catch {}

    providerPromise = null

    provider =
      await getProvider()
  }

  //
  // ESTA chamada abre diretamente
  // o modal oficial WalletConnect/Reown.
  //
  if (!provider.session) {
    await provider.connect()
  }

  if (
    !provider.session ||
    !sessionHasRabbit(
      provider.session
    )
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

  const account =
    rabbitAccount(provider)

  if (!account) {
    throw new Error(
      'Wallet connected without a Rabbit account.'
    )
  }

  return {
    kind:
      'walletconnect',

    name:
      provider.session
        ?.peer
        ?.metadata
        ?.name ||
      'WalletConnect',

    icon:
      provider.session
        ?.peer
        ?.metadata
        ?.icons?.[0] ||
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
