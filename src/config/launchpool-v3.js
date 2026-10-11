import ABIS from './launchpool-v3-abi.json'

export const RABBIT_LAUNCHPOOL_V3 = Object.freeze({
  chainId: 9280,
  rpc: 'https://rpc-testnet.rabbitchain.org',
  explorer: 'https://explorer-testnet.rabbitchain.org',

  registry: '0xF91E5A51BD3F9d3e53Cb45Fd05fa5e1A6A464af4',
  market: '0x2f68D6Bd4aA78D01405BC5b11188b7cFA3aBb896',
  feeVault: '0xe8B8e8165f54633f10ae8B5bDb9113d220119347',
  lpLock: '0x60E3918a6727E42f7ea45d409438Fd46A7B58F1b',
  tRUSD: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',

  saleBps: 8000,
  liquidityBps: 2000,
  version: 3
})

export const RABBIT_LAUNCHPOOL_V3_ABI = ABIS
