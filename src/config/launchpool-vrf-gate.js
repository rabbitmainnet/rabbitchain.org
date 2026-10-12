import { parseAbi } from 'viem'

export const VRF_FACTORY_GATE_ABI = parseAbi([
  'function roundOfLaunch(uint256) view returns (address)',
  'function allocationsOfLaunch(uint256) view returns (address)'
])

export const VRF_ROUND_GATE_ABI = parseAbi([
  'function settled() view returns (bool)',
  'function cancelled() view returns (bool)'
])

export const VRF_ALLOCATIONS_GATE_ABI = parseAbi([
  'function funded() view returns (bool)',
  'function processed() view returns (bool)',
  'function refunded() view returns (bool)'
])
