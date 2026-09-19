export const RABBIT_VRF = Object.freeze({
  enabled: false,

  coordinator: '0xdFc21aeA108e3F527E5f236ebf354dc8262719da',

  rabbitSwapPair: '0x8b9f4581b71964049ac6be03b22000132438b385',

  tokens: {
    tRUSD: {
      address: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',
      decimals: 6,
    },
    tWRAB: {
      address: '0xef03f43ed1cb21d56cb0b26934d09cabc1994c8d',
      decimals: 18,
    },
  },

  baseFeeTrusdBaseUnits: 10_000,

  twap: {
    minimumWindowSeconds: 1800,
    observationCadenceSeconds: 300,
    maximumAgeSeconds: 3600,
    ringSize: 16,
  },

  status: 'Protocol integration in progress',
})
