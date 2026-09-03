export const TESTNET_FAUCETS = {
  tRAB: {
    key: 'tRAB',
    symbol: 'tRAB',
    name: 'Test RAB',
    description: 'Native Rabbit Testnet asset',
    address: '0x35D6E9299B5146aAC8E997B43E146fd5659474d5',
    decimals: 18,
    mode: 'funded',
    defaultClaimAmount: 10n * 10n ** 18n,
    defaultCooldown: 24 * 60 * 60,
  },
  tRUSD: {
    key: 'tRUSD',
    symbol: 'tRUSD',
    name: 'Testnet Rabbit USD',
    description: 'USD-denominated test asset',
    address: '0xaB9fEc2ff2b4f481F585b2358f3842C66e0194bd',
    decimals: 6,
    mode: 'autonomous',
    defaultClaimAmount: 1_000n * 10n ** 6n,
    defaultCooldown: 24 * 60 * 60,
  },
}

export const TRAB_FAUCET_ABI = [
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'cooldown',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'canClaim',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'eligible', type: 'bool' },
      { name: 'availableAt', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'faucetBalance', type: 'uint256' },
    ],
  },
]

export const TRUSD_FAUCET_ABI = [
  {
    type: 'function',
    name: 'claimFaucet',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'faucetAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'faucetCooldown',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'canClaimFaucet',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'eligible', type: 'bool' },
      { name: 'availableAt', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  },
]
