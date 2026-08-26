export const PLATFORM_DEFAULT_NETWORK = 'testnet'

export const PLATFORM_NETWORKS = {
  testnet: {
    key: 'testnet',
    label: 'TESTNET',
    name: 'Rabbit Testnet',
    chainId: '9280',

    status: 'PRE-LAUNCH',
    swapLive: false,
    showFaucet: true,

    defaultFrom: 'RAB',
    defaultTo: 'RUSD',

    tokens: [
      {
        symbol: 'RAB',
        name: 'Rabbit',
        decimals: 18,
        native: true,
        address: null,
        logo: '/rabbit-mark.png',
      },
      {
        symbol: 'RUSD',
        name: 'Rabbit USD Test Asset',
        decimals: 18,
        native: false,
        address: null,
        logo: null,
      },
      {
        symbol: 'tUSDT',
        name: 'Test USDT',
        decimals: 6,
        native: false,
        address: null,
        logo: null,
      },
      {
        symbol: 'tUSDC',
        name: 'Test USDC',
        decimals: 6,
        native: false,
        address: null,
        logo: null,
      },
    ],
  },

  mainnet: {
    key: 'mainnet',
    label: 'MAINNET',
    name: 'Rabbit Mainnet',
    chainId: '928',

    status: 'COMING LATER',
    swapLive: false,
    showFaucet: false,

    defaultFrom: 'RAB',
    defaultTo: null,

    tokens: [
      {
        symbol: 'RAB',
        name: 'Rabbit',
        decimals: 18,
        native: true,
        address: null,
        logo: '/rabbit-mark.png',
      },
    ],
  },
}
