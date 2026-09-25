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

const METAMASK_ID =
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'

const TRUST_ID =
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'

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
    of Object.values(session.namespaces || {})
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
        return value.split(':').slice(2).join(':')
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

    //
    // Rabbit é REQUIRED.
    // Se a wallet não aceitar 9280,
    // a conexão falha antes de fingir
    // que está conectada.
    //
    chains: [
      RABBIT_CHAIN_ID,
    ],

    rpcMap: {
      [RABBIT_CHAIN_ID]:
        network.rpcUrl,
    },

    showQrModal: true,

    //
    // Recursos adicionais não bloqueiam
    // a sessão se a wallet não oferecer.
    //
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
      'wallet_sendCalls',
      'wallet_getCallsStatus',
      'wallet_showCallsStatus',
      'wallet_getCapabilities',
    ],

    optionalEvents: [
      'accountsChanged',
      'chainChanged',
    ],

    //
    // Não reutiliza as sessões antigas
    // das tentativas anteriores.
    //
    customStoragePrefix:
      'rabbit-wc-9280-clean-v1',

    qrModalOptions: {
      themeMode:
        'light',

      enableExplorer:
        true,

      enableMobileFullScreen:
        true,

      //
      // Trust em destaque.
      //
      explorerRecommendedWalletIds: [
        TRUST_ID,
      ],

      //
      // MetaMask fica fora daqui.
      // Ela já tem o caminho oficial Rabbit
      // que está funcionando.
      //
      explorerExcludedWalletIds: [
        METAMASK_ID,
      ],

      themeVariables: {
        '--wcm-font-family':
          'Inter, system-ui, sans-serif',

        '--wcm-accent-color':
          '#635bff',

        '--wcm-background-color':
          '#ffffff',

        '--wcm-container-border-radius':
          '18px',

        '--wcm-z-index':
          '2147483000',
      },
    },
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
  mode = 'qr'
) {
  let provider =
    await getProvider()

  //
  // Só ocorre após clique explícito do usuário.
  // Nunca fazemos auto-connect no carregamento.
  //
  if (
    provider.session &&
    !sessionHasRabbit(provider.session)
  ) {
    try {
      await provider.disconnect()
    } catch {}

    providerPromise = null
    provider = await getProvider()
  }

  //
  // No botão All Wallets tentamos abrir
  // diretamente a lista completa do AppKit.
  // Se a versão decidir usar a tela padrão,
  // a conexão continua normalmente.
  //
  if (
    mode === 'all' &&
    !provider.session
  ) {
    provider.once?.(
      'display_uri',
      () => {
        window.setTimeout(() => {
          try {
            provider.modal?.open?.({
              view: 'AllWallets',
            })
          } catch {}
        }, 50)
      }
    )
  }

  if (!provider.session) {
    await provider.connect()
  }

  if (
    !provider.session ||
    !sessionHasRabbit(provider.session)
  ) {
    throw new Error(
      'This wallet does not support Rabbit Testnet through WalletConnect.'
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
