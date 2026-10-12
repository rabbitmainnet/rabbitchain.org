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


// Rabbit Launchpool V3 — mandatory on-chain VRF.
// Existing V3 contracts remain available for older launches.
export const RABBIT_LAUNCHPOOL_V3_VRF = Object.freeze({
  ...RABBIT_LAUNCHPOOL_V3,
  market: '0x83273047c7aa7a7621cb4b3cc855b7fbae61560d',
  feeVault: '0xbc354a2f5efc85c0d2c0af0b1655bbc3e9044372',
  vrfFactory: '0x4ffe7e4debf8a897629af714c270181d470591f9',
  mandatoryVRF: true
})
