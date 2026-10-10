import ABIS from './launchpool-abi.json'

export const RABBIT_LAUNCHPOOL_TESTNET = Object.freeze({
  chainId: 9280,
  rpc: 'https://rpc-testnet.rabbitchain.org',
  explorer: 'https://explorer-testnet.rabbitchain.org',
  registry: '0x4a75AE20142C3b6426a35D6E74e938c666ECE0Ac',
  lpLock: '0x60E3918a6727E42f7ea45d409438Fd46A7B58F1b',
  market: '0x3724097D57e00D8B7BB38eE49404f03968465569',
  feeVault: '0xE1CB00A16371109a2CC6F1B520f31c564C101Bed',
  tRUSD: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',
  router: '0xF5A9BF9Df2c6CEb8987b2cb26f4CcE310577A7b0',
  swapFactory: '0x3455FF1c81B8FC1D8229019766495cD2a9A6C577',
  treasury: '0x6CfCE6e48085F1B463D90d9Dcad1DFA6F732fF35',
})

export const RABBIT_LAUNCHPOOL_ABI = ABIS
